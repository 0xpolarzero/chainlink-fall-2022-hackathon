import { Collapse, Skeleton } from 'antd';

export default function PromisesCollapseSkeleton({ arraySize }) {
  const { Panel } = Collapse;

  return (
    <Collapse
      accordion={true}
      bordered={false}
      className='site-collapse-custom-collapse'
    >
      {Array(arraySize)
        .fill(true)
        .map((_, i) => {
          return (
            <Panel
              key={i}
              header={
                <Skeleton
                  className='section-explore-skeleton'
                  active
                  paragraph={{ rows: 1 }}
                  title={false}
                />
              }
              className='site-collapse-custom-panel'
              collapsible='disabled'
            />
          );
        })}
    </Collapse>
  );
}
