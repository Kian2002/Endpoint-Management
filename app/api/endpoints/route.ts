import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET() {
  try {
    const snapshots = await query(
      'SELECT * FROM snapshots ORDER BY created_at DESC LIMIT 10',
      []
    );
    
    const alerts = await query(
      'SELECT * FROM alerts WHERE status = "Active" ORDER BY created_at DESC',
      []
    );

    return NextResponse.json({
      snapshots,
      alerts
    });
  } catch (error) {
    console.error('Error fetching endpoint data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch endpoint data' },
      { status: 500 }
    );
  }
} 