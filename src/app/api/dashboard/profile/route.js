import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOperator } from '@/lib/operator-auth'
import { cleanText } from '@/lib/clean-text'
import { dbReason } from '@/lib/db-errors'

export const dynamic = 'force-dynamic'

const ID = 'singleton'

export async function GET() {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    const profile = await prisma.tradeProfile.findUnique({ where: { id: ID } })
    return NextResponse.json({ profile: profile || null })
  } catch (error) {
    console.error('profile read failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}

export async function PUT(request) {
  const operator = await requireOperator()
  if (operator !== true) return NextResponse.json({ error: operator.error }, { status: operator.status })
  try {
    const b = await request.json()
    const data = {
      engineerName: cleanText(b.engineerName, 60),
      aboutLine: cleanText(b.aboutLine, 120),
      engineerPhoto: cleanText(b.engineerPhoto, 500),
      vehicleReg: cleanText(b.vehicleReg, 12)?.toUpperCase().replace(/[^A-Z0-9]/g, '') || null,
      vehicleMake: cleanText(b.vehicleMake, 40),
      vehicleModel: cleanText(b.vehicleModel, 40),
      vehicleColour: cleanText(b.vehicleColour, 30),
      vehiclePhoto: cleanText(b.vehiclePhoto, 500),
    }
    const profile = await prisma.tradeProfile.upsert({
      where: { id: ID }, create: { id: ID, ...data }, update: data,
    })
    return NextResponse.json({ profile })
  } catch (error) {
    console.error('profile write failed:', error)
    return NextResponse.json({ error: dbReason(error) }, { status: 503 })
  }
}
