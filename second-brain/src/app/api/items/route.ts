import { NextResponse } from 'next/server';
import { searchItems, getAllTags, getSources, getStats, createItem, deleteItem } from '@/lib/db';
import { Item } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('query') || undefined;
    const types = searchParams.get('types')?.split(',').filter(Boolean);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const sources = searchParams.get('sources')?.split(',').filter(Boolean);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const items = searchItems({
      query,
      types,
      tags,
      sources,
      startDate,
      endDate,
    });

    const paginatedItems = items.slice(offset, offset + limit);

    return NextResponse.json({
      items: paginatedItems,
      total: items.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in items API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const item: Item = await request.json();
    createItem(item);
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    deleteItem(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
