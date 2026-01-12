import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { costBasis, logisticsCost, taxRate } = body;

    if (!costBasis || costBasis <= 0) {
      return NextResponse.json(
        { error: 'Custo de produção inválido' },
        { status: 400 }
      );
    }

    const settings = await saveSettings({
      costBasis: parseFloat(costBasis),
      logisticsCost: logisticsCost ? parseFloat(logisticsCost) : 80,
      taxRate: taxRate ? parseFloat(taxRate) : 0.05,
      isConfigured: true,
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar configurações' },
      { status: 500 }
    );
  }
}
