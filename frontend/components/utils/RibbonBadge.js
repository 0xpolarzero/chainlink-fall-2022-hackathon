import { Badge, Popover } from 'antd';
import { useState } from 'react';

export default function RibbonBadge({ isPromiseLocked }) {
  const [showBadgeTooltip, setShowBadgeTooltip] = useState(false);

  return (
    <a
      href='#'
      onMouseEnter={() => setShowBadgeTooltip(true)}
      onMouseLeave={() => setShowBadgeTooltip(false)}
    >
      <Badge.Ribbon
        className={isPromiseLocked ? 'badge-locked' : 'badge-unlocked'}
        text={
          isPromiseLocked === undefined || isPromiseLocked === null ? (
            <span>
              <i className='fas fa-spinner fa-spin'></i>
            </span>
          ) : isPromiseLocked ? (
            <span>
              <i className='fas fa-lock'></i> Locked
            </span>
          ) : (
            <span>
              <i className='fas fa-lock-open'></i> Unlocked
            </span>
          )
        }
      >
        <Popover
          content={
            <div>
              <p>There are two states for a promise:</p>
              <p>
                <b>Locked</b> - All parties have approved the promise, and it
                has been validated. It can't be modified anymore, nor can it be
                unlocked.
              </p>
              <p>
                <b>Unlocked</b> - The promise is still being edited by the
                parties. They can still approve it and verify their Twitter.
              </p>
            </div>
          }
          title={isPromiseLocked ? 'Locked' : 'Unlocked'}
          trigger='hover'
          open={showBadgeTooltip}
        />
      </Badge.Ribbon>
    </a>
  );
}
