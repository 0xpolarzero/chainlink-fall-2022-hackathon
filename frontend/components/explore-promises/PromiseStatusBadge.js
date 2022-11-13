import { Skeleton, Tooltip } from 'antd';

export default function PromiseStatusBadge({ isPromiseLocked }) {
  if (isPromiseLocked === undefined || isPromiseLocked === null) {
    return (
      <Skeleton active paragraph={{ rows: 1 }} title={false} width={100} />
    );
  }

  return (
    <span
      className={
        isPromiseLocked
          ? 'promise-status-lock locked'
          : 'promise-status-lock unlocked'
      }
    >
      <Tooltip
        title={
          <div>
            <p>There are two states for a promise:</p>
            <p>
              <b>Locked</b> - All parties have approved the promise, and it has
              been locked. No additional participant can be added anymore. The
              parties can still verify their Twitter accounts.
            </p>
            <p>
              <b>Unlocked</b> - The promise is still being edited by the
              parties. They can approve it, and add new participants. Each time
              a participant is added, all promise approvals are reset, so
              everyone can approve the new version.
            </p>
          </div>
        }
        trigger='hover'
      >
        {isPromiseLocked ? (
          <span>
            <i className='fas fa-lock'></i>
            <span>Locked</span>
          </span>
        ) : (
          <span>
            <i className='fas fa-lock-open'></i>
            <span>Unlocked</span>
          </span>
        )}
      </Tooltip>
    </span>
  );
}
