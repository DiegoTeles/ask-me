/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // necessário para o satori (geração de imagem OG)
    serverComponentsExternalPackages: ['sharp'],
  },
}

module.exports = nextConfig
