import { Link } from 'react-router-dom'

export default function GridSelector() {
    return (
        <section className="flex flex-col items-center justify-center py-12">
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2 text-center">
                Seleccionar Sector
            </h2>
            <p className="text-body-md text-on-surface-variant mb-10 text-center max-w-md">
                Elegí la cuadrícula a inspeccionar.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                <Link
                    to="/cuadricula/1"
                    className="group bg-surface border-2 border-outline-variant hover:border-primary rounded-xl p-10 flex flex-col items-center gap-4 transition-all hover:shadow-lg"
                >
                    <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                        <span className="material-symbols-outlined text-4xl">grid_view</span>
                    </div>
                    <span className="text-headline-md font-headline-md text-primary">CUADRÍCULA 1</span>
                </Link>

                <Link
                    to="/cuadricula/3"
                    className="group bg-surface border-2 border-outline-variant hover:border-primary rounded-xl p-10 flex flex-col items-center gap-4 transition-all hover:shadow-lg"
                >
                    <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                        <span className="material-symbols-outlined text-4xl">grid_view</span>
                    </div>
                    <span className="text-headline-md font-headline-md text-primary">CUADRÍCULA 3</span>
                </Link>
            </div>
        </section>
    )
}