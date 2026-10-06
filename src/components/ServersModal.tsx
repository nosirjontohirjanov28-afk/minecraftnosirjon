import React, { useState } from 'react';
import { GameServer } from '../types/minecraft';
import { X, Wifi, Users, User, ShieldAlert, Sparkles, Plus, Play } from 'lucide-react';
import { sound } from '../services/soundEngine';

interface ServersModalProps {
  servers: GameServer[];
  currentServer: GameServer;
  onSelectServer: (server: GameServer) => void;
  onClose: () => void;
  onAddCustomServer: (server: GameServer) => void;
}

export const ServersModal: React.FC<ServersModalProps> = ({
  servers,
  currentServer,
  onSelectServer,
  onClose,
  onAddCustomServer,
}) => {
  const [filter, setFilter] = useState<'all' | 'solo' | 'multiplayer' | 'horror' | 'minigame'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerIp, setNewServerIp] = useState('');

  const filteredServers = servers.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'solo') return s.type === 'solo';
    if (filter === 'multiplayer') return s.type === 'multiplayer';
    if (filter === 'horror') return s.isHorror;
    if (filter === 'minigame') return s.type === 'minigame';
    return true;
  });

  const handleAddServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName || !newServerIp) return;

    const custom: GameServer = {
      id: `custom-${Date.now()}`,
      name: newServerName,
      type: 'multiplayer',
      descriptionUz: "Foydalanuvchi tomonidan qo'shilgan maxsus server.",
      descriptionEn: 'Custom user server.',
      bannerColor: 'from-purple-800 to-stone-950',
      bannerIcon: 'Users',
      playersOnline: Math.floor(Math.random() * 50) + 1,
      maxPlayers: 100,
      pingMs: Math.floor(Math.random() * 30) + 15,
      ip: newServerIp,
      version: '1.21.4',
      gameMode: 'survival',
      features: ['Shaxsiy IP', 'Multiplayer'],
    };

    onAddCustomServer(custom);
    setShowAddForm(false);
    setNewServerName('');
    setNewServerIp('');
    sound.playStep();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="mc-panel w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-900">
          <div>
            <h2 className="font-pixel text-base text-amber-400">
              Minecraft Master Serverlari (Server Hub)
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Yakkaxon (Solo) va Koʻp oʻyinchili (Multiplayer) serverlarga ulaning
            </p>
          </div>
          <button
            onClick={onClose}
            className="mc-button p-1.5 text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-stone-950 border-b border-stone-800 text-xs">
          <div className="flex items-center gap-1 font-pixel">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 transition-colors ${
                filter === 'all' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              Barchasi ({servers.length})
            </button>
            <button
              onClick={() => setFilter('solo')}
              className={`px-3 py-1 transition-colors ${
                filter === 'solo' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              Yakkaxon (Solo)
            </button>
            <button
              onClick={() => setFilter('multiplayer')}
              className={`px-3 py-1 transition-colors ${
                filter === 'multiplayer' ? 'bg-blue-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              Multiplayer SMP
            </button>
            <button
              onClick={() => setFilter('horror')}
              className={`px-3 py-1 transition-colors ${
                filter === 'horror' ? 'bg-red-700 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              Qoʻrqinchli (Horror)
            </button>
            <button
              onClick={() => setFilter('minigame')}
              className={`px-3 py-1 transition-colors ${
                filter === 'minigame' ? 'bg-amber-700 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              Bedwars / Skyblock
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mc-button mc-button-green px-2.5 py-1 font-pixel text-[11px] flex items-center gap-1 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Server Qoʻshish</span>
          </button>
        </div>

        {/* Add Server Form */}
        {showAddForm && (
          <form onSubmit={handleAddServer} className="p-3 bg-stone-900 border-b border-stone-800 flex gap-2 text-xs">
            <input
              type="text"
              placeholder="Server Nomi (masalan: O'zbek Craft)"
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
              className="flex-1 bg-stone-950 border border-stone-700 px-3 py-1.5 text-stone-100 placeholder:text-stone-500 font-pixel text-xs"
              required
            />
            <input
              type="text"
              placeholder="IP Manzil (masalan: play.craft.uz:25565)"
              value={newServerIp}
              onChange={(e) => setNewServerIp(e.target.value)}
              className="flex-1 bg-stone-950 border border-stone-700 px-3 py-1.5 text-stone-100 placeholder:text-stone-500 font-pixel text-xs"
              required
            />
            <button type="submit" className="mc-button mc-button-green px-3 py-1.5 font-pixel text-xs text-white">
              Saqlash
            </button>
          </form>
        )}

        {/* Server List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredServers.map((server) => {
            const isCurrent = currentServer.id === server.id;

            return (
              <div
                key={server.id}
                className={`p-3.5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-950/20'
                    : 'border-stone-800 bg-stone-900/60 hover:bg-stone-900 hover:border-stone-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-11 h-11 shrink-0 flex items-center justify-center border border-stone-700 ${
                    server.isHorror
                      ? 'bg-red-950 text-red-400'
                      : server.type === 'solo'
                      ? 'bg-emerald-950 text-emerald-400'
                      : 'bg-blue-950 text-cyan-400'
                  }`}>
                    {server.isHorror ? (
                      <ShieldAlert className="w-6 h-6 animate-pulse" />
                    ) : server.type === 'solo' ? (
                      <User className="w-6 h-6" />
                    ) : (
                      <Users className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-pixel text-sm text-stone-100 font-bold">
                        {server.name}
                      </h3>
                      {server.isHorror && (
                        <span className="text-[10px] font-pixel text-red-400 uppercase tracking-wider">
                          [HORROR]
                        </span>
                      )}
                      {server.type === 'solo' && (
                        <span className="text-[10px] font-pixel text-emerald-400 uppercase tracking-wider">
                          [YAKKAXON / OFFLINE]
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                      {server.descriptionUz}
                    </p>

                    {/* Unboxed Metadata as per frontend-design skill */}
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-stone-400 font-pixel">
                      <span className="text-amber-300">{server.ip}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-stone-300">{server.version}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-stone-300 uppercase">{server.gameMode}</span>
                      <span aria-hidden="true">·</span>
                      {server.features.slice(0, 3).map((f, idx) => (
                        <React.Fragment key={idx}>
                          <span>{f}</span>
                          {idx < 2 && <span aria-hidden="true">/</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Ping, Players & Connect Button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-3 font-pixel text-xs">
                    {/* Ping */}
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Wifi className="w-3.5 h-3.5" />
                      <span>{server.pingMs}ms</span>
                    </div>

                    {/* Online count */}
                    <div className="flex items-center gap-1 text-stone-300">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {server.playersOnline}/{server.maxPlayers}
                      </span>
                    </div>
                  </div>

                  {isCurrent ? (
                    <div className="font-pixel text-xs text-amber-400 px-3 py-1 bg-amber-950/60 border border-amber-500">
                      ✓ HOZIR OʻYNAMOQDASIZ
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        sound.playStep();
                        onSelectServer(server);
                        onClose();
                      }}
                      className="mc-button mc-button-green px-4 py-1.5 font-pixel text-xs text-white flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>ULANISH (CONNECT)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
