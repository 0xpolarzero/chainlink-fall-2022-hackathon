import { Button } from 'antd';

export default function RowPromiseAddParticipant({
  contractAttributes,
  isPromiseLocked,
}) {
  return (
    <>
      <div className='drawer-item-title'>New participant</div>
      <Button type='primary'>
        <i className='fas fa-user-plus' /> Add a participant
      </Button>
    </>
  );
}
