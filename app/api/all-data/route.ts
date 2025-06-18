import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET() {
  try {
    const comparison_component = await query('SELECT * FROM comparison_component', []);
    const comparison_result = await query('SELECT * FROM comparison_result', []);
    const get_process_temp = await query('SELECT * FROM get_process_temp', []);
    const installed_software = await query('SELECT * FROM installed_software', []);
    const pc_asset = await query('SELECT * FROM pc_asset', []);
    const process_log = await query('SELECT * FROM process_log', []);

    return NextResponse.json({
      status: 'success',
      data: {
        comparison_component,
        comparison_result,
        get_process_temp,
        installed_software,
        pc_asset,
        process_log
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch all data:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}