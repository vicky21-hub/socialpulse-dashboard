import React, { useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { apiService } from '../services/api';
import type { KPISummary } from '../types';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  RotateCcw,
  Download,
  ArrowRight,
  CheckCircle2,
  Table as TableIcon,
} from 'lucide-react';

interface UploadPageProps {
  onNavigate: (tab: string) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onNavigate }) => {
  const { triggerRefresh } = useFilters();
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'replace' | 'append'>('replace');
  const [uploading, setUploading] = useState(false);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    inserted: number;
    preview: any[];
    kpis: KPISummary;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.csv')) {
        setGeneralError('Please select a valid .csv file.');
        setFile(null);
        return;
      }
      setFile(selected);
      setGeneralError(null);
      setErrorList([]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setGeneralError('Please select a CSV file first.');
      return;
    }

    try {
      setUploading(true);
      setGeneralError(null);
      setErrorList([]);
      setSuccessInfo(null);

      const res = await apiService.uploadCSV(file, mode);

      if (res.status === 'validation_failed') {
        setErrorList(res.errors || ['Validation failed.']);
      } else if (res.status === 'success') {
        setSuccessInfo({
          message: res.message,
          inserted: res.inserted_records,
          preview: res.preview || [],
          kpis: res.updated_kpis,
        });
        triggerRefresh();
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrorList(err.response.data.errors);
      } else {
        setGeneralError(err.response?.data?.message || err.message || 'Failed to upload CSV.');
      }
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      'post_id,platform,post_date,post_time,content_type,caption,likes,comments,shares,impressions,reach,followers,engagement_rate,hashtags\n' +
      'DEMO_101,Instagram,2026-03-15,19:30,Reels,5 developer productivity tips that save hours! #techtrends #coding,450,85,92,6200,5400,28500,10.11,#techtrends #coding\n' +
      'DEMO_102,YouTube,2026-03-16,14:00,Shorts,Python one-liner to parse JSON like a senior engineer #programming #python,1200,210,180,14500,12000,64200,10.97,#programming #python\n' +
      'DEMO_103,Instagram,2026-03-17,10:15,Images,Clean code review checklist for pull requests #developercommunity,310,45,28,4900,4100,28600,7.82,#developercommunity\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_social_media_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Overview header */}
      <div className="text-center sm:text-left">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Data Import &amp; Dataset Management
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Upload custom social media metrics datasets, run automatic schema validation, or reset sample data.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleUpload} className="space-y-6">
          {/* Dropzone */}
          <div className="relative rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 p-8 text-center transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {file ? file.name : 'Choose a CSV file or drag & drop here'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supported format: standard UTF-8 CSV with valid social engagement fields
                </p>
              </div>
              {file && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <FileCheck className="h-3.5 w-3.5" />
                  <span>Ready to upload ({(file.size / 1024).toFixed(1)} KB)</span>
                </span>
              )}
            </div>
          </div>

          {/* Mode Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Database Insertion Mode:
              </span>
              <span className="text-[11px] text-slate-400">
                Choose whether to overwrite or merge with current records
              </span>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="replace"
                  checked={mode === 'replace'}
                  onChange={() => setMode('replace')}
                  className="accent-indigo-600"
                />
                <span>Replace Dataset</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="append"
                  checked={mode === 'append'}
                  onChange={() => setMode('append')}
                  className="accent-indigo-600"
                />
                <span>Append to Existing</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Sample CSV Template</span>
            </button>

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <span>Validating &amp; Ingesting...</span>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  <span>Upload &amp; Recalculate Metrics</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Validation Errors Display */}
        {errorList.length > 0 && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/70 p-5 dark:border-rose-900/50 dark:bg-rose-950/20">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm mb-2">
              <AlertCircle className="h-4 w-4" />
              <span>Validation Errors Detected ({errorList.length})</span>
            </div>
            <ul className="list-disc pl-5 text-xs text-rose-700 dark:text-rose-400 space-y-1">
              {errorList.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {generalError && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
            {generalError}
          </div>
        )}

        {/* Success State */}
        {successInfo && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Upload &amp; Calculation Complete!</span>
              </div>
              <button
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                <span>View Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              {successInfo.message} All dashboard analytics, posting time recommendations, and charts have been automatically synchronized.
            </p>

            {/* Quick KPI preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 p-3 text-center border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[10px] text-slate-400 block">Total Posts</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {successInfo.kpis.total_posts.toLocaleString()}
                </span>
              </div>
              <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 p-3 text-center border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[10px] text-slate-400 block">Avg Engagement</span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                  {successInfo.kpis.avg_engagement_rate}%
                </span>
              </div>
              <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 p-3 text-center border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[10px] text-slate-400 block">Total Impressions</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {successInfo.kpis.total_impressions.toLocaleString()}
                </span>
              </div>
              <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 p-3 text-center border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[10px] text-slate-400 block">Total Engagements</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {(
                    successInfo.kpis.total_likes +
                    successInfo.kpis.total_comments +
                    successInfo.kpis.total_shares
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Ingested Preview Table */}
            {successInfo.preview.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <TableIcon className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Previewing First Ingested Records ({successInfo.preview.length})</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-white/80 dark:bg-slate-900/80">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-2 px-3">ID</th>
                        <th className="py-2 px-3">Platform</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3 text-right">Likes</th>
                        <th className="py-2 px-3 text-right">Impressions</th>
                        <th className="py-2 px-3 text-right">Eng. Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {successInfo.preview.map(row => (
                        <tr key={row.post_id}>
                          <td className="py-1.5 px-3 font-mono font-medium">{row.post_id}</td>
                          <td className="py-1.5 px-3">{row.platform}</td>
                          <td className="py-1.5 px-3">{row.content_type}</td>
                          <td className="py-1.5 px-3">{row.post_date}</td>
                          <td className="py-1.5 px-3 text-right font-medium">{row.likes}</td>
                          <td className="py-1.5 px-3 text-right font-medium">{row.impressions}</td>
                          <td className="py-1.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                            {row.engagement_rate}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Required CSV Schema Reference Guide */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Required CSV Schema Fields
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your CSV file must include these column headers:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[
            'post_id',
            'platform',
            'post_date',
            'post_time',
            'content_type',
            'caption',
            'likes',
            'comments',
            'shares',
            'impressions',
            'reach',
            'followers',
            'engagement_rate',
            'hashtags',
          ].map(field => (
            <span
              key={field}
              className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {field}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
