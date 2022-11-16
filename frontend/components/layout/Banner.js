export default function Banner() {
  const closeBanner = () => {
    const banner = document.querySelector('.banner');
    banner.style.display = 'none';
  };

  return (
    <div className='banner'>
      All files sent to Arweave using Bundlr are actually{' '}
      <span className='bold'>stored only for a week</span>. This is a limitation{' '}
      <span className='bold'>specific to deploying on a testnet</span>.
      <i className='fas fa-times' onClick={closeBanner} />
    </div>
  );
}
