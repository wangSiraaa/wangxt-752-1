import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { X, QrCode, Check, Search } from 'lucide-react';
import { EQUIPMENT_STATUS_LABELS } from '@/types';
import type { EquipmentStatus } from '@/types';
import { cn } from '@/lib/utils';

const EQ_STATUS_OPTIONS: EquipmentStatus[] = ['normal', 'faulty', 'offline', 'handled'];

const EQ_TYPE_ICONS: Record<string, string> = {
  projector: '📽️',
  whiteboard: '📋',
  video_conf: '📹',
  speaker: '🔊',
  display: '🖥️',
};

export default function ScanModal() {
  const { rooms, showScanModal, setShowScanModal, scanEquipment } = useStore();
  const [scanInput, setScanInput] = useState('');
  const [selectedEq, setSelectedEq] = useState<{ id: string; roomId: string; name: string; type: string; status: EquipmentStatus; roomName: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const allEquipment = rooms.flatMap((room) =>
    room.equipment.map((eq) => ({ ...eq, roomId: room.id, roomName: room.name }))
  );

  const handleSearch = () => {
    const found = allEquipment.find((e) => e.id === scanInput.trim());
    if (found) {
      setSelectedEq(found);
      setSuccessMsg(null);
    } else {
      setSelectedEq(null);
      setSuccessMsg('未找到对应的设备标签');
    }
  };

  const handleStatusChange = (status: EquipmentStatus) => {
    if (!selectedEq) return;
    scanEquipment(selectedEq.id, status);
    setSelectedEq({ ...selectedEq, status });
    setSuccessMsg(`设备「${selectedEq.name}」状态已更新为「${EQUIPMENT_STATUS_LABELS[status]}」`);
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const handleClose = () => {
    setShowScanModal(false);
    setScanInput('');
    setSelectedEq(null);
    setSuccessMsg(null);
  };

  if (!showScanModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" data-testid="scan-modal">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">扫码录入设备状态</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
            data-testid="scan-modal-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">扫描设备标签二维码或输入设备ID</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  data-testid="scan-input"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="例如：eq-8"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSearch}
                data-testid="scan-search-btn"
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                搜索
              </button>
            </div>
          </div>

          {successMsg && (
            <div
              data-testid="scan-success"
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-800 font-medium">{successMsg}</p>
            </div>
          )}

          {selectedEq && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{EQ_TYPE_ICONS[selectedEq.type] ?? '🔧'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedEq.name}</h3>
                      <p className="text-xs text-gray-500">所属会议室：{selectedEq.roomName}</p>
                    </div>
                  </div>
                  <span className={cn(
                    'text-xs px-2.5 py-1 rounded-full font-semibold',
                    selectedEq.status === 'normal' && 'bg-green-100 text-green-800',
                    selectedEq.status === 'faulty' && 'bg-red-100 text-red-800',
                    selectedEq.status === 'offline' && 'bg-gray-200 text-gray-700',
                    selectedEq.status === 'handled' && 'bg-blue-100 text-blue-800'
                  )}>
                    {EQUIPMENT_STATUS_LABELS[selectedEq.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-500">设备ID：{selectedEq.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">更新设备状态</label>
                <div className="grid grid-cols-2 gap-2">
                  {EQ_STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      data-testid={`scan-status-${status}`}
                      onClick={() => handleStatusChange(status)}
                      className={cn(
                        'px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                        selectedEq.status === status
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {EQUIPMENT_STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!selectedEq && !successMsg && (
            <div className="text-center py-8 text-gray-400">
              <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">扫描设备标签二维码或输入设备ID开始录入</p>
              <p className="text-xs mt-1">可用设备ID示例：eq-1, eq-4, eq-8, eq-10</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
