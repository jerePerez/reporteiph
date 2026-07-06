export default function Loader({ label = 'Cargando...', size = 100 }) {
    // Distribución de puntos según el logo: I (3 en vertical) - P (3 + 2) - H (3 + 2)
    const dots = [
        { x: 10, y: 10 }, { x: 10, y: 35 }, { x: 10, y: 60 }, // I
        { x: 35, y: 35 }, { x: 35, y: 60 }, { x: 35, y: 85 }, // P (palo)
        { x: 60, y: 35 }, { x: 60, y: 60 },                   // P (panza, arriba)
        { x: 85, y: 10 }, { x: 85, y: 35 }, { x: 85, y: 60 }, // H (primer palo)
        { x: 110, y: 35 }, { x: 110, y: 60 },                 // H (segundo trazo, abajo)
    ]

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-10">
            <svg viewBox="0 0 120 95" width={size * 2} height={size * 2} className="text-primary">
                {dots.map((dot, i) => (
                    <circle
                        key={i}
                        cx={dot.x}
                        cy={dot.y}
                        r="8"
                        fill="currentColor"
                        className="iph-loader-dot"
                        style={{ animationDelay: `${i * 0.09}s` }}
                    />
                ))}
            </svg>
            {label && (
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">{label}</p>
            )}
        </div>
    )
}