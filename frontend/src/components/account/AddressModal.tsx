import React, { useState, useEffect } from 'react';
import { hapticFeedback } from '../../utils/haptics';

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  tag: 'Home' | 'Work' | 'Other';
  isDefault?: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: UserAddress) => void;
  initialData?: UserAddress | null;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Omit<UserAddress, 'id'>>({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    tag: 'Home',
    isDefault: false,
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        phone: initialData.phone,
        line1: initialData.line1,
        line2: initialData.line2 || '',
        city: initialData.city,
        state: initialData.state,
        pincode: initialData.pincode,
        tag: initialData.tag,
        isDefault: initialData.isDefault || false,
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: 'Maharashtra',
        pincode: '',
        tag: 'Home',
        isDefault: false,
      });
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handlePincodeChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: clean }));

    // Auto-detect city from PIN prefix
    if (clean.length === 6) {
      if (clean.startsWith('40')) setFormData((p) => ({ ...p, city: 'Mumbai', state: 'Maharashtra' }));
      else if (clean.startsWith('11')) setFormData((p) => ({ ...p, city: 'New Delhi', state: 'Delhi' }));
      else if (clean.startsWith('56')) setFormData((p) => ({ ...p, city: 'Bengaluru', state: 'Karnataka' }));
      else if (clean.startsWith('50')) setFormData((p) => ({ ...p, city: 'Hyderabad', state: 'Telangana' }));
      else if (clean.startsWith('60')) setFormData((p) => ({ ...p, city: 'Chennai', state: 'Tamil Nadu' }));
      else if (clean.startsWith('70')) setFormData((p) => ({ ...p, city: 'Kolkata', state: 'West Bengal' }));
      else if (clean.startsWith('41')) setFormData((p) => ({ ...p, city: 'Pune', state: 'Maharashtra' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Recipient name is required');
      return;
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!formData.line1.trim()) {
      setErrorMsg('Street address / House number is required');
      return;
    }
    if (formData.pincode.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code');
      return;
    }

    hapticFeedback.success();
    onSave({
      id: initialData?.id || `addr-${Date.now()}`,
      ...formData,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white text-zinc-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 z-10 border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h3 className="text-lg font-black text-zinc-950 tracking-tight">
              {initialData ? 'Edit Delivery Destination' : 'Add New Address'}
            </h3>
            <p className="text-xs text-zinc-500">
              Courier partners verify location for white-glove doorstep handover.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Address Tag Selector (Home, Work, Other) */}
          <div>
            <label className="block font-bold text-zinc-500 uppercase tracking-wider mb-1.5 text-[10px]">
              Destination Type
            </label>
            <div className="flex gap-2">
              {(['Home', 'Work', 'Other'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, tag: t }))}
                  className={`flex-1 py-2 rounded-xl font-bold border transition ${
                    formData.tag === t
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-500 uppercase tracking-wider mb-1 text-[10px]">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Arjun Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-semibold focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-500 uppercase tracking-wider mb-1 text-[10px]">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                placeholder="10-digit number"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-semibold focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-500 uppercase tracking-wider mb-1 text-[10px]">
              Flat / House No. / Building / Street *
            </label>
            <input
              type="text"
              required
              value={formData.line1}
              onChange={(e) => setFormData((p) => ({ ...p, line1: e.target.value }))}
              placeholder="e.g. Flat 402, Sea Breeze Apts, Hill Road"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-semibold focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-500 uppercase tracking-wider mb-1 text-[10px]">
              Landmark / Area (Optional)
            </label>
            <input
              type="text"
              value={formData.line2}
              onChange={(e) => setFormData((p) => ({ ...p, line2: e.target.value }))}
              placeholder="e.g. Opposite Nature Basket, Bandra West"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-semibold focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-zinc-500 uppercase tracking-wider mb-1 text-[10px]">
                PIN Code *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                placeholder="400050"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono font-bold focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-500 uppercase tracking-wider mb-1 text-[10px]">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                placeholder="Mumbai"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-semibold focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-500 uppercase tracking-wider mb-1 text-[10px]">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                placeholder="Maharashtra"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-semibold focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData((p) => ({ ...p, isDefault: e.target.checked }))}
              className="w-4 h-4 rounded text-zinc-950 focus:ring-zinc-950 border-zinc-300"
            />
            <span className="font-semibold text-zinc-700">Make this my default shipping destination</span>
          </label>

          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white font-bold hover:bg-zinc-800 transition active:scale-95 shadow-sm"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
