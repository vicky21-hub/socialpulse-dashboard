import React, { useEffect, useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { apiService } from '../services/api';
import type { Post, PostsResponse } from '../types';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';

export const PostsPage: React.FC = () => {
  const { filters, setSearch, refreshTrigger } = useFilters();
  const [data, setData] = useState<PostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('post_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await apiService.getPosts(
          filters,
          page,
          perPage,
          sortBy,
          sortOrder
        );
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();
    return () => {
      isMounted = false;
    };
  }, [filters, page, perPage, sortBy, sortOrder, refreshTrigger]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getEngagementBadge = (rate: number) => {
    if (rate >= 8.0) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800';
    }
    if (rate >= 4.0) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Social Media Content Library
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total of {data?.total_count || 0} publications matching criteria
          </p>
        </div>

        {/* Per page selector */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Show:</span>
          <select
            value={perPage}
            onChange={e => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('post_id')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('platform')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Platform</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('post_date')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Published</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4 min-w-[200px]">Caption &amp; Tags</th>
                <th
                  onClick={() => handleSort('likes')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Likes</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('comments')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Comments</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('shares')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Shares</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('impressions')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Impressions</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('engagement_rate')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Engagement</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                [...Array(perPage)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={10} className="py-3 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                    </td>
                  </tr>
                ))
              ) : !data || data.posts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No posts matched the current filters and search query.
                  </td>
                </tr>
              ) : (
                data.posts.map(post => (
                  <tr
                    key={post.post_id}
                    onClick={() => setSelectedPost(post)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-600 dark:text-slate-400">
                      {post.post_id}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
                          post.platform === 'Instagram'
                            ? 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                        }`}
                      >
                        {post.platform}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {post.post_date} <span className="text-[10px] opacity-75">{post.post_time}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {post.content_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="truncate font-medium text-slate-800 dark:text-slate-200" title={post.caption}>
                        {post.caption}
                      </p>
                      <p className="truncate text-[10px] text-indigo-500 font-mono">
                        {post.hashtags}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      {post.likes.toLocaleString('en-US')}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      {post.comments.toLocaleString('en-US')}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      {post.shares.toLocaleString('en-US')}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      {post.impressions.toLocaleString('en-US')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-bold ${getEngagementBadge(
                          post.engagement_rate
                        )}`}
                      >
                        {post.engagement_rate}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data && data.total_pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 gap-3">
            <div>
              Showing Page <strong className="text-slate-800 dark:text-slate-200">{page}</strong> of{' '}
              <strong className="text-slate-800 dark:text-slate-200">{data.total_pages}</strong> (
              {data.total_count} total posts)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 bg-white p-1.5 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                disabled={page >= data.total_pages}
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                className="rounded-lg border border-slate-200 bg-white p-1.5 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute right-4 top-4 rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span
                className={`rounded-lg px-2.5 py-0.5 text-xs font-bold ${
                  selectedPost.platform === 'Instagram'
                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                }`}
              >
                {selectedPost.platform}
              </span>
              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {selectedPost.content_type}
              </span>
              <span className="font-mono text-xs text-slate-400">{selectedPost.post_id}</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {selectedPost.post_date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {selectedPost.post_time}
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 mb-5 text-sm text-slate-800 dark:text-slate-200">
              <p className="leading-relaxed whitespace-pre-wrap">{selectedPost.caption}</p>
              <p className="mt-2 text-xs font-mono text-indigo-500 font-semibold">{selectedPost.hashtags}</p>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-white dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 block">Engagement Rate</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {selectedPost.engagement_rate}%
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-white dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 block">Total Impressions</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedPost.impressions.toLocaleString('en-US')}
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-white dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 block">Unique Reach</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedPost.reach.toLocaleString('en-US')}
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-white dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 block">Likes</span>
                <span className="text-base font-bold text-rose-600">
                  {selectedPost.likes.toLocaleString('en-US')}
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-white dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 block">Comments</span>
                <span className="text-base font-bold text-amber-600">
                  {selectedPost.comments.toLocaleString('en-US')}
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-white dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 block">Shares</span>
                <span className="text-base font-bold text-emerald-600">
                  {selectedPost.shares.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between">
              <span>Account Followers at publish: {selectedPost.followers.toLocaleString('en-US')}</span>
              <span>Formula: (Likes + Comments + Shares) / Impressions × 100</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
