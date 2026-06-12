"use client";

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export function Skeleton({ width = "100%", height = "16px", borderRadius = "2px", className }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className || ""}`}
      style={{ width, height, borderRadius }}
    />
  );
}

export function BalanceSkeleton() {
  return (
    <div className="card section-gap">
      <div className="card-title">Balances</div>
      <div className="card-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="metric">
            <Skeleton width="40%" height="10px" className="mb-8" />
            <Skeleton width="70%" height="28px" className="mb-4" />
            <Skeleton width="30%" height="10px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TransferSkeleton() {
  return (
    <div className="card section-gap">
      <div className="card-title">Recent USDC Transfers</div>
      <div className="transfers-list">
        {[0, 1, 2].map((i) => (
          <div key={i} className="transfer-row">
            <Skeleton width="40%" height="12px" />
            <Skeleton width="25%" height="12px" />
            <Skeleton width="15%" height="12px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlertSkeleton() {
  return (
    <div className="alert alert-green" style={{ opacity: 0.4 }}>
      <Skeleton width="60%" height="14px" />
    </div>
  );
}