'use client'

import dynamic from 'next/dynamic'

const SiteApp = dynamic(() => import('@/components/site-app'), { ssr: false })

export default function Page() {
  return <SiteApp />
}
