import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';
import { io } from 'socket.io-client';

const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
const SOCKET_URL = 'https://medimatch-backend-4t7f.onrender.com';

export default function VideoConsult() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [muted, setMuted]           = useState(false);
  const [cameraOff, setCameraOff]   = useState(false);
  const [chatOpen, setChatOpen]     = useState(true);
  const [message, setMessage]       = useState('');
  const [callTime, setCallTime]     = useState(0);
  const [callActive, setCallActive] = useState(true);
  const [remoteUser, setRemoteUser] = useState(null);
  const [localTracks, setLocalTracks] = useState({ audio: null, video: null });
  const [messages, setMessages]     = useState([]);
  const [patientReport, setPatientReport] = useState(null);
  const [endedByOther, setEndedByOther] = useState(false);

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const chatEndRef     = useRef(null);
  const timerRef       = useRef(null);
  const socketRef      = useRef(null);
  const hasEndedRef    = useRef(false); // prevents double cleanup/navigation

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    joinChannel();
    fetchMessages();
    fetchReport();
    setupSocket();
    return () => {
      socketRef.current?.disconnect();
      cleanup(false);
    };
  }, []);

  useEffect(() => {
    if (!callActive) return;
    timerRef.current = setInterval(() => setCallTime(s => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [callActive]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Socket.io: listen for the other side ending the call ───────────────────
  const setupSocket = () => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit('join-call', { appointmentId });

    socket.on('call-ended', () => {
      if (hasEndedRef.current) return;
      hasEndedRef.current = true;
      setEndedByOther(true);
      setCallActive(false);
      cleanup(false); // close own tracks/leave agora, but don't re-emit end-call
      setTimeout(() => navigate('/patient/dashboard'), 2000);
    });
  };

  const joinChannel = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('https://medimatch-backend-4t7f.onrender.com/api/video/token',
        { appointmentId, role: 'patient' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      agoraClient.on('user-published', async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setRemoteUser(user);
          setTimeout(() => user.videoTrack?.play(remoteVideoRef.current), 100);
        }
        if (mediaType === 'audio') user.audioTrack?.play();
      });

      agoraClient.on('user-unpublished', () => {
        setRemoteUser(null);
      });

      await agoraClient.join(data.appId, data.channelName, data.token, data.uid);
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalTracks({ audio: audioTrack, video: videoTrack });
      videoTrack.play(localVideoRef.current);
      await agoraClient.publish([audioTrack, videoTrack]);
    } catch (err) {
      console.error('Join error:', err);
    }
  };

  const cleanup = async (nav = true) => {
    clearInterval(timerRef.current);
    localTracks.audio?.close();
    localTracks.video?.close();
    try { await agoraClient.leave(); } catch (e) {}
    try {
      await axios.post('https://medimatch-backend-4t7f.onrender.com/api/video/end', { appointmentId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
    } catch (e) {}
    if (nav) navigate('/patient/dashboard');
  };

  const toggleMute = () => {
    localTracks.audio?.setEnabled(muted);
    setMuted(!muted);
  };

  const toggleCamera = () => {
    localTracks.video?.setEnabled(cameraOff);
    setCameraOff(!cameraOff);
  };

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`https://medimatch-backend-4t7f.onrender.com/api/video/messages/${appointmentId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessages(data.map(m => ({
        from: m.sender_role,
        text: m.message,
        time: new Date(m.sent_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      })));
    } catch (e) { console.error(e); }
  };

  const fetchReport = async () => {
    try {
      const { data } = await axios.get(`https://medimatch-backend-4t7f.onrender.com/api/appointments/${appointmentId}/report`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPatientReport(data);
    } catch (e) {}
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    const text = message.trim();
    setMessage('');
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { from: 'patient', text, time }]);
    try {
      await axios.post('https://medimatch-backend-4t7f.onrender.com/api/video/message',
        { appointmentId, message: text, senderRole: 'patient' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
    } catch (e) { console.error(e); }
  };

  // ─── End Call — notify the other side via socket, then cleanup ──────────────
  const handleEndCall = async () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    socketRef.current?.emit('end-call', { appointmentId, endedBy: 'patient' });
    setCallActive(false);
    await cleanup(false);
    setTimeout(() => navigate('/patient/dashboard'), 2000);
  };

  const formatTime = (s) =>
    `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
          <span className="text-white font-bold text-sm">MediMatch</span>
          <span className="text-gray-400 text-xs">· Video Consultation</span>
        </div>
        <div className="flex items-center gap-4">
          {callActive && (
            <div className="flex items-center gap-2 bg-red-500 bg-opacity-20 border border-red-500 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
              <span className="text-red-400 text-xs font-bold">{formatTime(callTime)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"/>
            <span className="text-gray-300 text-xs">Encrypted</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user.name?.[0] || 'S'}
          </div>
          <span className="text-gray-300 text-sm">{user.name || 'Patient'}</span>
        </div>
      </div>

      {/* Call Ended Screen */}
      {!callActive ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">👋</div>
            <h3 className="text-white text-xl font-bold mb-2">
              {endedByOther ? 'Doctor ended the call' : 'Call Ended'}
            </h3>
            <p className="text-gray-400 text-sm">Duration: {formatTime(callTime)}</p>
            <p className="text-gray-400 text-sm mt-1">Returning to dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">

          {/* Main Video Area */}
          <div className="flex-1 flex flex-col relative">
            <div className="flex-1 relative bg-gray-800 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-gray-900 opacity-60"/>

              <div ref={remoteVideoRef} className="absolute inset-0 z-10"/>

              {!remoteUser && (
                <div className="relative z-20 text-center">
                  <div className="w-32 h-32 bg-blue-700 rounded-full flex items-center justify-center text-6xl mx-auto mb-4 shadow-2xl">
                    🧑‍⚕️
                  </div>
                  <h3 className="text-white text-xl font-bold">Waiting for doctor...</h3>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"/>
                    <span className="text-yellow-400 text-xs font-medium">Connecting...</span>
                  </div>
                </div>
              )}

              {remoteUser && (
                <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                  <span className="text-green-400 text-xs font-medium">Connected</span>
                </div>
              )}

              {patientReport && (
                <div className="absolute top-4 right-4 z-20 bg-gray-800 bg-opacity-90 rounded-xl p-3 text-xs text-white w-48">
                  <div className="font-bold mb-2">📄 Patient Report</div>
                  {patientReport.glucose && (
                    <div className="text-red-400">🔴 Glucose: {patientReport.glucose}</div>
                  )}
                  {patientReport.hemoglobin && (
                    <div className="text-orange-400">🟡 Hemoglobin: {patientReport.hemoglobin}</div>
                  )}
                  {patientReport.cholesterol && (
                    <div className="text-green-400">🟢 Cholesterol: {patientReport.cholesterol}</div>
                  )}
                </div>
              )}

              <div className="absolute bottom-4 right-4 z-20 w-36 h-24 bg-gray-700 rounded-xl border-2 border-blue-500 overflow-hidden shadow-lg">
                <div ref={localVideoRef} className="w-full h-full"/>
                {cameraOff && (
                  <div className="absolute inset-0 bg-gray-700 flex flex-col items-center justify-center gap-1">
                    <div className="text-2xl">📷</div>
                    <div className="text-gray-400 text-xs">Camera Off</div>
                  </div>
                )}
                <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-white bg-black bg-opacity-40 py-0.5">
                  {user.name || 'You'} (You)
                </div>
              </div>

              {muted && (
                <div className="absolute top-4 left-4 z-20 bg-red-500 bg-opacity-90 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                  🔇 You are muted
                </div>
              )}
            </div>

            {/* Control Bar */}
            <div className="bg-gray-800 px-8 py-4 flex items-center justify-center gap-4 border-t border-gray-700">
              <button onClick={toggleMute}
                className={`flex flex-col items-center gap-1 w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${muted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                <span className="text-xl">{muted ? '🔇' : '🎤'}</span>
                <span className="text-white text-xs">{muted ? 'Unmute' : 'Mute'}</span>
              </button>
              <button onClick={toggleCamera}
                className={`flex flex-col items-center gap-1 w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${cameraOff ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                <span className="text-xl">{cameraOff ? '📷' : '📹'}</span>
                <span className="text-white text-xs">{cameraOff ? 'Start' : 'Stop'}</span>
              </button>
              <button className="flex flex-col items-center gap-1 w-16 h-16 rounded-2xl bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all">
                <span className="text-xl">🖥️</span>
                <span className="text-white text-xs">Share</span>
              </button>
              <button onClick={fetchReport}
                className="flex flex-col items-center gap-1 w-16 h-16 rounded-2xl bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all">
                <span className="text-xl">📄</span>
                <span className="text-white text-xs">Report</span>
              </button>
              <button onClick={handleEndCall}
                className="flex flex-col items-center gap-1 w-20 h-16 rounded-2xl bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all shadow-lg">
                <span className="text-xl">📵</span>
                <span className="text-white text-xs font-bold">End Call</span>
              </button>
              <button onClick={() => setChatOpen(!chatOpen)}
                className={`flex flex-col items-center gap-1 w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${chatOpen ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                <span className="text-xl">💬</span>
                <span className="text-white text-xs">Chat</span>
              </button>
            </div>
          </div>

          {/* Chat Panel */}
          {chatOpen && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <span className="text-white font-bold text-sm">💬 Chat</span>
                <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === 'patient' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-48 rounded-2xl px-3 py-2 ${msg.from === 'patient' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-700 text-gray-100 rounded-bl-sm'}`}>
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                      <p className="text-xs mt-1 opacity-60">{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef}/>
              </div>
              <div className="p-3 border-t border-gray-700 flex gap-2">
                <input
                  type="text" value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white text-xs px-3 py-2 rounded-xl outline-none placeholder-gray-400 border border-gray-600 focus:border-blue-500"
                />
                <button onClick={sendMessage}
                  className="w-9 h-9 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center text-white transition-all">
                  ➤
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
