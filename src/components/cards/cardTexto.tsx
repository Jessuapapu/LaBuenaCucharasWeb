

export default function CardComponents({ Titulo, Contenido, href }: { Titulo: any, Contenido: any[] | String, href: any}) {
    return (
        <>
            <a href={href} className=" max-w-sm p-6 border bg-white rounded-2xl shadow hover:bg-neutral-200 border-neutral-300 ">
                <h5 className="mb-3 text-2xl font-semibold tracking-tight text-gray-900 leading-8">
                    {Titulo}
                </h5>
                <p className="">
                    {Contenido}
                </p>
            </a>
        </>

    )

}
