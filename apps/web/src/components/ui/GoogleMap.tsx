interface GoogleMapProps {
  lat: number;
  lng: number;
  title: string;
}

export function GoogleMap({ lat, lng, title }: GoogleMapProps) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '';
  const src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${lat},${lng}&zoom=15`;

  if (!key) {
    return (
      <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
        Map unavailable
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden border border-gray-100">
      <iframe
        src={src}
        title={`Map location for ${title}`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
