import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Whole Hospitality',
        short_name: 'WholeHospitality',
        description: 'Whole Hospitality - Professional Backend Solutions',
        start_url: '/',
        display: 'standalone',
        background_color: '#334155',
        theme_color: '#334155',
        icons: [
            {
                src: '/logo.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
