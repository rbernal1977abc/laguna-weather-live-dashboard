import dynamic from 'next/dynamic';

// Load map only on client side (not during SSR)
const MapInner = dynamic(() => import('./MapInner'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f0f0f0',
      borderRadius: '8px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#666' }}>Loading map...</div>
      </div>
    </div>
  )
});

export default function MapClient(props) { 
  return <MapInner {...props} />; 
}
