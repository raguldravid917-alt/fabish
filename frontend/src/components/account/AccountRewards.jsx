import React from 'react';
import { Award, Sparkles, CheckCircle2, Gift, Zap, RefreshCw, History } from 'lucide-react';
import { useRewardsQuery } from '../../hooks/queries/useRewardsQuery';

const AccountRewards = ({ user }) => {
  const { data: rewardsData, isLoading } = useRewardsQuery();

  const points = rewardsData?.points ?? (user?.rewardPoints || user?.points || 0);
  const currentTier = rewardsData?.tier || (points > 1000 ? 'Gold' : points > 300 ? 'Silver' : 'Bronze');
  const transactions = rewardsData?.transactions || [];

  const nextTier = currentTier === 'Bronze' ? 'Silver' : currentTier === 'Silver' ? 'Gold' : 'Platinum';
  const nextTierPoints = currentTier === 'Bronze' ? 300 : currentTier === 'Silver' ? 1000 : 2500;
  const progressPercent = Math.min(Math.round((points / nextTierPoints) * 100), 100);

  return (
    <div className="space-y-6 select-none">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#FAF9F5] via-[#F4F2E6] to-[#FAF9F5] border border-[#E8E6D9] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#729855]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#E8E6D9] text-[#729855] text-[10px] font-heading font-extrabold uppercase tracking-widest mb-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              Fabish Organic Circle
            </span>
            <h2 className="font-heading text-2xl font-extrabold text-[#1C2415]">
              Your Loyalty Rewards
            </h2>
            <p className="text-xs text-gray-600 font-body">Earn 1 point for every ₹10 spent on certified organic formulations</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-[#E8E6D9] rounded-2xl px-6 py-4 text-center sm:text-right shadow-xs">
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-gray-400 block">
              Available Balance
            </span>
            <div className="flex items-center justify-center sm:justify-end gap-2 mt-1">
              <Award className="w-6 h-6 text-[#729855]" />
              <span className="font-heading font-extrabold text-3xl text-[#1C2415]">
                {points}
              </span>
              <span className="text-xs font-heading font-bold text-[#729855]">PTS</span>
            </div>
            <span className="text-[11px] font-heading font-bold text-gray-500 block mt-1">
              Value = ₹{points} Discount
            </span>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="space-y-2 relative z-10 bg-white/80 border border-[#E8E6D9] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs font-heading font-bold text-[#1C2415]">
            <span>Current Tier: <strong className="text-[#729855]">{currentTier}</strong></span>
            <span>Next Tier: <strong className="text-gray-500">{nextTier} ({nextTierPoints} PTS)</strong></span>
          </div>

          <div className="w-full h-3 bg-[#E8E6D9]/60 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#3A4D23] to-[#729855] rounded-full transition-all duration-1000 shadow-2xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-gray-500 font-body">
            You need <strong className="text-[#1C2415]">{Math.max(nextTierPoints - points, 0)} more points</strong> to unlock {nextTier} tier benefits &amp; exclusive quarterly gifts.
          </p>
        </div>
      </div>

      {/* Reward History */}
      {transactions.length > 0 && (
        <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-heading text-sm font-extrabold uppercase tracking-widest text-[#1C2415] flex items-center gap-2">
            <History className="w-4 h-4 text-[#729855]" />
            Reward Transaction History
          </h3>

          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx._id || tx.id} className="flex items-center justify-between p-3.5 bg-[#FAF9F5] border border-[#E8E6D9] rounded-2xl text-xs">
                <div>
                  <span className="font-heading font-bold text-[#1C2415] block">{tx.description}</span>
                  <span className="text-[10px] text-gray-400 font-body">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ''}</span>
                </div>
                <span className={`font-heading font-extrabold text-sm ${tx.type === 'EARN' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {tx.type === 'EARN' ? '+' : '-'}{tx.points} PTS
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perks Grid */}
      <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="font-heading text-sm font-extrabold uppercase tracking-widest text-[#1C2415] flex items-center gap-2">
          <Gift className="w-4 h-4 text-[#729855]" />
          Tier Member Perks
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: '100% Point Value', desc: '1 Reward Point = ₹1 off at checkout', active: true },
            { title: 'Free Express Delivery', desc: 'Complimentary shipping on all tier orders', active: points > 300 },
            { title: 'Early Sale Access', desc: '24-hour priority access to seasonal launches', active: points > 500 },
          ].map((perk, idx) => (
            <div key={idx} className="bg-[#FAF9F5] border border-[#E8E6D9] rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${perk.active ? 'text-[#729855]' : 'text-gray-300'}`} />
                <h4 className="font-heading font-bold text-xs text-[#1C2415]">{perk.title}</h4>
              </div>
              <p className="text-[11px] text-gray-500 font-body pl-6">{perk.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AccountRewards;
