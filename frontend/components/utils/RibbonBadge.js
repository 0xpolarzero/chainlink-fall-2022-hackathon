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
                unlocked. The PDF can be backed up to a persistent storage. The
                parties can still verify their Twitter accounts, but they won't
                be able to revoke their approval nor remove their associated
                Twitter accounts.
              </p>
              <p>
                <b>Unlocked</b> - The promise is still being edited by the
                parties. They can still approve it, and the PDF only storage
                location is the URI set by the creator.
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
