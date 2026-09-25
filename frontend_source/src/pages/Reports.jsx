import { useState } from 'react';
import { FileText, Mail, Download, Eye, Clock, X, CheckCircle, Radio, Users, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useDisasterAlert } from '../context/DisasterAlertContext';

const templates = [
  {
    id: 1,
    name: 'Daily Cyclone Bulletin',
    type: 'Daily Bulletin',
    desc: 'Standard IMD operational bulletin issued at 06:00 and 18:00 IST.',
    icon: '📋',
    time: '5 min',
    body: "A Very Severe Cyclonic Storm 'DANA' lay centered at 1200 UTC of today over west-central Bay of Bengal. It is very likely to intensify further and move north-northwestwards across the Odisha coastline near Puri with peak winds of 175 km/h.",
  },
  {
    id: 2,
    name: 'Special Cyclone Warning (Landfall)',
    type: 'Special Warning',
    desc: 'Emergency flash bulletin issued 24h before expected coastal crossing.',
    icon: '⚠️',
    time: '2 min',
    body: "URGENT SPECIAL ADVISORY: Cyclone DANA has undergone rapid intensification. Coastal districts of Puri, Jagatsinghpur, and Kendrapara are placed under RED ALERT. Evacuation of low-lying areas within 5km of coastline is advised immediately.",
  },
  {
    id: 3,
    name: 'Post-Event Analysis & Climatology',
    type: 'Post-Event Report',
    desc: 'Detailed scientific review of storm genesis, track recurvature, and radar analysis.',
    icon: '📊',
    time: '15 min',
    body: "Comprehensive post-event analysis detailing INSAT-3D thermal brightness temperature anomaly, automated Dvorak T-number progression, and ensemble track verification versus observed landfall coordinates.",
  },
  {
    id: 4,
    name: 'Public Advisory & Fisherman Warning',
    type: 'Public Advisory',
    desc: 'Plain language advisory for civil defense, port authorities, and maritime fleets.',
    icon: '📢',
    time: '3 min',
    body: "Total suspension of fishing operations over central and north Bay of Bengal. Sea condition is phenomenal with wave heights exceeding 6 meters. Coastal residents are advised to remain indoors.",
  },
];

export default function Reports() {
  const { showToast } = useToast();
  const { publishBulletinFromAdmin, setForecastAlert } = useDisasterAlert();

  const [formData, setFormData] = useState({
    cycloneName: 'CYCLONE DANA',
    reportType: 'Daily Bulletin #15',
    validTime: '14-Sep-2024 18:00 IST',
    authority: 'Cyclone Warning Division, IMD New Delhi',
    body: "A Very Severe Cyclonic Storm 'DANA' lay centered at 1200 UTC of 14 September 2024 near latitude 15.4°N and longitude 87.2°E over west-central Bay of Bengal. It is very likely to intensify further and cross Odisha coast near Puri during afternoon of 14 September 2024...",
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedReportView, setSelectedReportView] = useState(null);

  const [recentReports, setRecentReports] = useState([
    { id: 1, name: 'Cyclone DANA — Bulletin #14', date: '14-Sep 06:00 IST', type: 'Daily Bulletin', author: 'Dr. M. Kumar', status: 'Published' },
    { id: 2, name: 'Special Warning — DANA Landfall', date: '13-Sep 18:00 IST', type: 'Special Warning', author: 'Dr. P. Sharma', status: 'Published' },
    { id: 3, name: 'REMAL — Advisory #3', date: '12-Sep 06:00 IST', type: 'Daily Bulletin', author: 'Dr. M. Kumar', status: 'Draft' },
    { id: 4, name: 'Post-Event: BIPARJOY 2023', date: '25-Jun 2023', type: 'Post-Event', author: 'MoES Cyclone Team', status: 'Published' },
  ]);

  const handleSelectTemplate = (template) => {
    setFormData({
      ...formData,
      reportType: template.type,
      body: template.body,
    });
    showToast(`Loaded template: "${template.name}".`, 'info');
  };

  const handleAutoPopulate = () => {
    setFormData({
      cycloneName: 'CYCLONE DANA (BOB-02)',
      reportType: 'Special Warning Bulletin #16',
      validTime: '14-Sep-2024 18:00 IST (Immediate Action)',
      authority: 'National Cyclone Warning Centre, IMD',
      body: "OBSERVED POSITION: The Very Severe Cyclonic Storm 'DANA' lay centered at 1200 UTC today over west-central Bay of Bengal near lat 15.4°N, lon 87.2°E.\nFORECAST TRACK: The system is projected by AI ensemble models to track NNW and make landfall on Odisha Coast near Puri on 14-Sep ~18:00 IST with maximum sustained surface winds of 175 km/h.\nSTORM SURGE: Inundation of 3.5 to 4.2m above astronomical tide expected.\nACTION REQUIRED: Total suspension of maritime operations and evacuation of vulnerable coastal belt.",
    });
    showToast('Auto-populated bulletin with live telemetry from Cyclone DANA.', 'success');
  };

  const handleGenerateDownload = () => {
    const text = `===============================================================
GOVERNMENT OF INDIA - MINISTRY OF EARTH SCIENCES
INDIA METEOROLOGICAL DEPARTMENT
NATIONAL CYCLONE BULLETIN
===============================================================
System: ${formData.cycloneName}
Document: ${formData.reportType}
Valid Period: ${formData.validTime}
Issued By: ${formData.authority}
Timestamp: ${new Date().toUTCString()}

BULLETIN TEXT:
${formData.body}

DISTRIBUTION LIST:
- Cabinet Secretariat, Rashtrapati Bhavan
- National Disaster Management Authority (NDMA)
- National Disaster Response Force (NDRF)
- Chief Secretaries, Odisha & West Bengal
- Director General, Indian Coast Guard
===============================================================`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IMD_Bulletin_${formData.cycloneName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Generated and downloaded official IMD Bulletin document.', 'success');
  };

  const handleBroadcastToCitizens = () => {
    const isDana = formData.cycloneName.toUpperCase().includes('DANA');
    const isRemal = formData.cycloneName.toUpperCase().includes('REMAL');
    const targetCond = isDana ? 'severe' : isRemal ? 'intermediate' : 'safe';

    setForecastAlert(targetCond, {
      bulletin: {
        title: `${formData.cycloneName} — ${formData.reportType}`,
        headline: formData.body.split('\n')[0] || formData.body.slice(0, 140),
        windForecast: formData.body.includes('WIND') ? formData.body : `Gale surface winds reaching 175-185 km/h for ${formData.cycloneName} along coastal sectors.`,
        surgeForecast: formData.body.includes('SURGE') ? formData.body : 'Storm surge of 3.5m to 4.2m expected to inundate low-lying coastal belts.',
        author: 'Dr. M. Kumar (Senior Meteorologist)',
        authority: formData.authority,
      },
    });

    showToast('Official Bulletin Published & Broadcast to Citizen Portal! Coastal residents are viewing this updated advisory in real time.', 'success', 6000);
    const newEntry = {
      id: Date.now(),
      name: `${formData.cycloneName} — ${formData.reportType}`,
      date: 'Just Now',
      type: formData.reportType,
      author: 'Dr. M. Kumar',
      status: 'Live on Citizen Portal',
    };
    setRecentReports(prev => [newEntry, ...prev]);
  };

  const handleEmailDistribution = () => {
    publishBulletinFromAdmin({
      title: `${formData.cycloneName} — ${formData.reportType}`,
      headline: formData.body.split('\n')[0] || formData.body.slice(0, 140),
      author: 'Dr. M. Kumar (Senior Meteorologist)',
      authority: formData.authority,
    });
    showToast('Broadcast dispatched to NDMA, NDRF, and State Disaster Commissioners via automated relay.', 'success', 5000);
    const newEntry = {
      id: Date.now(),
      name: `${formData.cycloneName} — ${formData.reportType}`,
      date: 'Just Now',
      type: formData.reportType,
      author: 'Dr. M. Kumar',
      status: 'Published',
    };
    setRecentReports(prev => [newEntry, ...prev]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-xs text-slate-500 dark:text-[#88a0c0] font-mono">Official Meteorological Communications</div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Reports, Bulletins & Public Advisories</h1>
      </div>

      {/* Template Gallery */}
      <div>
        <h2 className="text-xs font-bold tracking-widest text-slate-700 dark:text-[#88a0c0] uppercase font-mono mb-3">
          Standard IMD Bulletin Templates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map(t => (
            <div
              key={t.id}
              className="rounded-xl border border-slate-200 dark:border-[#1a3a6b] p-4 bg-white dark:bg-[#0d1f3c] hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col shadow-md"
            >
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">{t.name}</div>
              <div className="text-xs text-slate-500 dark:text-[#88a0c0] mb-3 flex-1">{t.desc}</div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#1a3a6b] font-mono">
                <span className="text-[11px] text-slate-500 dark:text-[#88a0c0] flex items-center gap-1">
                  <Clock size={11} /> ~{t.time}
                </span>
                <button
                  onClick={() => handleSelectTemplate(t)}
                  className="text-xs px-2.5 py-1 rounded font-bold text-slate-950 bg-cyan-400 dark:bg-[#00d4ff] hover:bg-cyan-300 transition-colors cursor-pointer shadow-sm"
                >
                  Load Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Report Builder */}
      <div className="rounded-xl border border-slate-200 dark:border-[#1a3a6b] p-5 bg-white dark:bg-[#0d1f3c] shadow-lg">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-xs font-bold tracking-widest text-slate-700 dark:text-[#88a0c0] uppercase font-mono">
            Operational Bulletin Builder
          </h2>
          <button
            onClick={handleAutoPopulate}
            className="text-xs px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-[#00d4ff] hover:bg-cyan-500/20 font-semibold transition-all font-mono cursor-pointer"
          >
            Auto-populate from Live DANA Telemetry
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 font-mono">
          <div>
            <label className="text-xs text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">Cyclone Name</label>
            <input
              value={formData.cycloneName}
              onChange={e => setFormData({ ...formData, cycloneName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">Report Heading / Bulletin #</label>
            <input
              value={formData.reportType}
              onChange={e => setFormData({ ...formData, reportType: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">Observation Valid Time</label>
            <input
              value={formData.validTime}
              onChange={e => setFormData({ ...formData, validTime: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-[#88a0c0] font-medium block mb-1">Issuing Authority</label>
            <input
              value={formData.authority}
              onChange={e => setFormData({ ...formData, authority: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-sm"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-slate-600 dark:text-[#88a0c0] font-medium block mb-1 font-mono">Advisory Content</label>
          <textarea
            rows={5}
            value={formData.body}
            onChange={e => setFormData({ ...formData, body: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-sm text-slate-900 dark:text-white font-mono leading-relaxed resize-none focus:outline-none focus:border-cyan-500 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          <button
            onClick={handleGenerateDownload}
            className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg font-bold text-slate-950 bg-cyan-400 dark:bg-[#00d4ff] hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Download size={14} />
            <span>Generate & Download Bulletin</span>
          </button>
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/40 transition-colors cursor-pointer shadow-sm"
          >
            <Eye size={14} className="text-cyan-600 dark:text-[#00d4ff]" />
            <span>Preview Official Format</span>
          </button>
          <button
            onClick={handleBroadcastToCitizens}
            className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 border border-red-500/50 cursor-pointer transition-all ml-auto shadow-lg shadow-red-500/25"
          >
            <Radio size={14} />
            <span>Broadcast to Citizen Portal</span>
          </button>
          <button
            onClick={handleEmailDistribution}
            className="flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer transition-all"
          >
            <Mail size={14} />
            <span>Email to NDRF & State</span>
          </button>
        </div>
      </div>

      {/* Recent Reports Archive */}
      <div>
        <h2 className="text-xs font-bold tracking-widest text-slate-700 dark:text-[#88a0c0] uppercase font-mono mb-3">
          Published Bulletins & Archives
        </h2>
        <div className="rounded-xl border border-slate-200 dark:border-[#1a3a6b] overflow-hidden bg-white dark:bg-[#0d1f3c] shadow-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1a3a6b] bg-slate-50 dark:bg-[#0a1628] text-xs font-bold text-slate-600 dark:text-[#88a0c0] uppercase tracking-wider font-mono">
                <th className="px-4 py-2.5 text-left">Bulletin Name</th>
                <th className="px-4 py-2.5 text-left">Timestamp</th>
                <th className="px-4 py-2.5 text-left">Type</th>
                <th className="px-4 py-2.5 text-left">Author</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#1a3a6b]/60 font-mono">
              {recentReports.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-[#102a4c] transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white font-sans">{r.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-[#88a0c0]">{r.date}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-[#88a0c0]">{r.type}</td>
                  <td className="px-4 py-3 text-xs text-slate-700 dark:text-white">{r.author}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded border text-xs font-bold ${
                        r.status.includes('Live')
                          ? 'border-red-500/40 bg-red-500/15 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                          : r.status === 'Published'
                          ? 'border-emerald-500/40 bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'border-yellow-500/40 bg-yellow-500/15 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedReportView(r)}
                      className="px-2.5 py-1 rounded text-xs border border-slate-300 dark:border-[#1a3a6b] text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/40 transition-colors mr-2 cursor-pointer shadow-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={handleGenerateDownload}
                      className="px-2.5 py-1 rounded text-xs border border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-[#00d4ff] hover:bg-cyan-500/20 transition-colors cursor-pointer"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREVIEW BULLETIN MODAL */}
      {(previewOpen || selectedReportView) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 dark:border-[#1a3a6b] p-6 bg-white dark:bg-[#0d1f3c] shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1a3a6b] mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-cyan-600 dark:text-[#00d4ff]" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Official IMD Meteorological Bulletin</h3>
              </div>
              <button
                onClick={() => { setPreviewOpen(false); setSelectedReportView(null); }}
                className="text-slate-500 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Letterhead Header */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b] text-center mb-4">
              <div className="text-[11px] font-bold text-slate-600 dark:text-[#88a0c0] font-mono">GOVERNMENT OF INDIA · MINISTRY OF EARTH SCIENCES</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 tracking-tight font-mono">INDIA METEOROLOGICAL DEPARTMENT</div>
              <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">CYCLONE WARNING DIVISION · MAUSAM BHAVAN, NEW DELHI</div>
            </div>

            <div className="space-y-2 text-xs mb-4 font-mono">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1a3a6b]">
                <span className="text-slate-600 dark:text-[#88a0c0]">Cyclone Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formData.cycloneName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1a3a6b]">
                <span className="text-slate-600 dark:text-[#88a0c0]">Bulletin Number:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formData.reportType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1a3a6b]">
                <span className="text-slate-600 dark:text-[#88a0c0]">Valid Horizon:</span>
                <span className="text-slate-800 dark:text-white">{formData.validTime}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0a1628] border border-slate-200 dark:border-[#1a3a6b] text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap mb-5">
              {formData.body}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setPreviewOpen(false); setSelectedReportView(null); }}
                className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-[#1a3a6b] text-xs text-slate-700 dark:text-[#88a0c0] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-sm"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleGenerateDownload();
                  setPreviewOpen(false);
                  setSelectedReportView(null);
                }}
                className="flex-1 py-2 rounded-lg font-bold text-xs text-slate-950 bg-cyan-400 dark:bg-[#00d4ff] hover:bg-cyan-300 transition-colors cursor-pointer shadow-sm"
              >
                Download Official PDF/Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
