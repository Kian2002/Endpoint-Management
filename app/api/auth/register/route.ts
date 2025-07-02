import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password, company, firstName, lastName, subscriptionPlan } = await request.json();

    if (!email || !password || !company) {
      return NextResponse.json(
        { error: 'Email, password, and company are required' },
        { status: 400 }
      );
    }

    const existingUsers = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await query(
      `INSERT INTO users (email, password_hash, company_name, first_name, last_name, subscription_plan) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, company, firstName || null, lastName || null, subscriptionPlan || 'monthly']
    ) as any;

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        userId: result.insertId 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 