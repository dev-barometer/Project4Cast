// Uniform three-dot menu component for design system consistency

export function ThreeDotMenu({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        padding: '4px 2px',
        ...style,
      }}
    >
      <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#5a6579' }} />
      <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#5a6579' }} />
      <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#5a6579' }} />
    </div>
  );
}

export function ThreeDotMenuHorizontal({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 3,
        padding: '4px 2px',
        ...style,
      }}
    >
      <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#5a6579' }} />
      <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#5a6579' }} />
      <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#5a6579' }} />
    </div>
  );
}
