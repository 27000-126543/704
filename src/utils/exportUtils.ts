import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { SimulationReport, ActivationRegion } from '../types';
import { formatDateTime, formatNumber } from './helpers';

export interface ExportDataOptions {
  format: 'csv' | 'excel' | 'json';
  scope: 'all' | 'by_brain_region' | 'by_optrode';
  brainRegions?: string[];
  optrodeIds?: string[];
}

export interface ChannelDataRow {
  channelIndex: number;
  optrodeId: string;
  brainRegion: string;
  snr: number;
  hbo: number;
  hbr: number;
  hbt: number;
  od760: number;
  od850: number;
  valid: boolean;
}

const generateMockChannelRows = (count: number): ChannelDataRow[] => {
  const regions = ['Fp1', 'Fp2', 'F3', 'F4', 'C3', 'C4', 'P3', 'P4', 'O1', 'O2', 'F7', 'F8', 'T3', 'T4', 'T5', 'T6'];
  const rows: ChannelDataRow[] = [];
  for (let i = 0; i < count; i++) {
    rows.push({
      channelIndex: i + 1,
      optrodeId: `OPT_${String(i + 1).padStart(2, '0')}`,
      brainRegion: regions[i % regions.length],
      snr: 15 + Math.random() * 20,
      hbo: 50 + Math.random() * 40,
      hbr: 25 + Math.random() * 20,
      hbt: 75 + Math.random() * 50,
      od760: 0.3 + Math.random() * 0.3,
      od850: 0.25 + Math.random() * 0.25,
      valid: Math.random() > 0.1,
    });
  }
  return rows;
};

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportData = (
  options: ExportDataOptions,
  report: SimulationReport | null,
  channelCount: number = 32
): { success: boolean; message?: string } => {
  if (!report) {
    return { success: false, message: '请先选择一个任务' };
  }

  if (options.scope === 'by_brain_region' && (!options.brainRegions || options.brainRegions.length === 0)) {
    return { success: false, message: '请先选择要导出的脑区' };
  }

  if (options.scope === 'by_optrode' && (!options.optrodeIds || options.optrodeIds.length === 0)) {
    return { success: false, message: '请先选择要导出的光极' };
  }

  const allRows = generateMockChannelRows(channelCount);
  let filteredRows = allRows;

  if (options.scope === 'by_brain_region') {
    filteredRows = allRows.filter((r) => options.brainRegions!.includes(r.brainRegion));
  } else if (options.scope === 'by_optrode') {
    filteredRows = allRows.filter((r) => options.optrodeIds!.includes(r.optrodeId));
  }

  const exportData = {
    taskInfo: {
      taskId: report.taskId,
      taskName: report.taskName,
      generatedAt: report.generatedAt,
      generatedBy: report.generatedBy,
      summary: report.summary,
    },
    statistics: {
      avgSNR: report.avgSNR,
      minSNR: report.minSNR,
      maxSNR: report.maxSNR,
      channelCount: report.channelCount,
      validChannels: report.validChannels,
      totalDuration: report.totalDuration,
      convergenceCount: report.convergenceCount,
    },
    parameters: report.parameters,
    activationRegions: report.activationRegions,
    channelData: filteredRows,
    exportInfo: {
      format: options.format,
      scope: options.scope,
      exportedAt: new Date(),
      recordCount: filteredRows.length,
    },
  };

  const filename = `${report.taskId}_${options.scope}${options.scope !== 'all' ? `_${options.brainRegions?.join('-') || options.optrodeIds?.join('-')}` : ''}`;

  try {
    if (options.format === 'json') {
      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      downloadFile(blob, `${filename}.json`);
      return { success: true };
    }

    if (options.format === 'csv') {
      const flatRows = filteredRows.map((r) => ({
        通道编号: r.channelIndex,
        光极ID: r.optrodeId,
        脑区: r.brainRegion,
        SNR_dB: r.snr.toFixed(2),
        HbO_uM: r.hbo.toFixed(2),
        HbR_uM: r.hbr.toFixed(2),
        HbT_uM: r.hbt.toFixed(2),
        OD_760nm: r.od760.toFixed(4),
        OD_850nm: r.od850.toFixed(4),
        有效通道: r.valid ? '是' : '否',
      }));
      const csv = Papa.unparse(flatRows);
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      downloadFile(blob, `${filename}.csv`);
      return { success: true };
    }

    if (options.format === 'excel') {
      const wb = XLSX.utils.book_new();

      const infoWs = XLSX.utils.aoa_to_sheet([
        ['任务信息'],
        ['任务ID', report.taskId],
        ['任务名称', report.taskName],
        ['生成时间', formatDateTime(report.generatedAt)],
        ['生成者', report.generatedBy],
        ['摘要', report.summary],
        [],
        ['统计信息'],
        ['平均SNR', `${report.avgSNR.toFixed(2)} dB`],
        ['最小SNR', `${report.minSNR.toFixed(2)} dB`],
        ['最大SNR', `${report.maxSNR.toFixed(2)} dB`],
        ['通道数', report.channelCount],
        ['有效通道', report.validChannels],
        ['总时长(s)', report.totalDuration],
        ['收敛次数', report.convergenceCount],
      ]);
      XLSX.utils.book_append_sheet(wb, infoWs, '任务信息');

      const channelWsData = [
        ['通道编号', '光极ID', '脑区', 'SNR(dB)', 'HbO(μM)', 'HbR(μM)', 'HbT(μM)', 'OD_760nm', 'OD_850nm', '有效'],
        ...filteredRows.map((r) => [
          r.channelIndex,
          r.optrodeId,
          r.brainRegion,
          r.snr,
          r.hbo,
          r.hbr,
          r.hbt,
          r.od760,
          r.od850,
          r.valid ? '是' : '否',
        ]),
      ];
      const channelWs = XLSX.utils.aoa_to_sheet(channelWsData);
      XLSX.utils.book_append_sheet(wb, channelWs, '通道数据');

      const activationWsData = [
        ['脑区ID', '脑区名称', '体积(mm³)', '峰值HbO', '峰值HbR', 't值', 'p值', '显著'],
        ...report.activationRegions.map((a: ActivationRegion) => [
          a.brainRegionId,
          a.brainRegionName,
          a.volumeMm3,
          a.peakHbO,
          a.peakHbR,
          a.tScore,
          a.pValue,
          a.significance ? '是' : '否',
        ]),
      ];
      const activationWs = XLSX.utils.aoa_to_sheet(activationWsData);
      XLSX.utils.book_append_sheet(wb, activationWs, '激活区域');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      downloadFile(blob, `${filename}.xlsx`);
      return { success: true };
    }

    return { success: false, message: '不支持的格式' };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, message: '导出失败：' + (error as Error).message };
  }
};

export const generateReportPDF = async (
  report: SimulationReport,
  getChartImage?: (chartKey: string) => string | null
): Promise<{ success: boolean; message?: string }> => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    doc.setFillColor(10, 22, 40);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setFillColor(0, 212, 255);
    doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');

    doc.setTextColor(10, 22, 40);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('fNIRS-SIM 模拟报告', margin + 10, y + 15);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`任务ID: ${report.taskId}`, margin + 10, y + 25);
    doc.text(`生成时间: ${formatDateTime(report.generatedAt)}`, pageWidth - margin - 60, y + 25);

    y += 45;

    doc.setTextColor(200, 230, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('1. 报告摘要', margin, y);
    y += 8;

    doc.setDrawColor(0, 212, 255, 0.3);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setTextColor(180, 210, 240);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const summaryLines = doc.splitTextToSize(report.summary, contentWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 6 + 8;

    doc.setTextColor(200, 230, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('任务参数:', margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 180, 210);
    doc.text(`  头模: ${report.headModelName}`, margin, y);
    doc.text(`  布局: ${report.layoutName}`, margin + 70, y);
    y += 5;
    doc.text(`  光源功率: ${report.parameters.sourcePower} mW`, margin, y);
    doc.text(`  波长: ${report.parameters.wavelengths.join('/')} nm`, margin + 70, y);
    y += 5;
    doc.text(`  光极间距: ${report.parameters.optrodeSpacing} mm`, margin, y);
    doc.text(`  SNR阈值: ${report.parameters.snrThreshold} dB`, margin + 70, y);
    y += 10;

    doc.setTextColor(200, 230, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('2. 质量指标', margin, y);
    y += 8;
    doc.setDrawColor(0, 212, 255, 0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    const metrics = [
      { label: '平均SNR', value: `${formatNumber(report.avgSNR, 1)} dB`, color: [0, 212, 255] },
      { label: '最小SNR', value: `${formatNumber(report.minSNR, 1)} dB`, color: [255, 138, 0] },
      { label: '最大SNR', value: `${formatNumber(report.maxSNR, 1)} dB`, color: [0, 255, 157] },
      { label: '有效通道', value: `${report.validChannels}/${report.channelCount}`, color: [0, 212, 255] },
    ];

    const metricWidth = contentWidth / 4;
    metrics.forEach((m, i) => {
      const x = margin + i * metricWidth;
      doc.setFillColor(m.color[0], m.color[1], m.color[2], 0.15);
      doc.roundedRect(x + 2, y, metricWidth - 4, 20, 2, 2, 'F');
      doc.setTextColor(m.color[0], m.color[1], m.color[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(m.value, x + metricWidth / 2, y + 12, { align: 'center' });
      doc.setTextColor(150, 180, 210);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(m.label, x + metricWidth / 2, y + 18, { align: 'center' });
    });

    y += 30;

    doc.setTextColor(200, 230, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('3. 激活脑区定位', margin, y);
    y += 8;
    doc.setDrawColor(0, 212, 255, 0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setTextColor(0, 212, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('脑区', margin, y);
    doc.text('体积(mm³)', margin + 45, y);
    doc.text('峰值HbO', margin + 80, y);
    doc.text('t值', margin + 110, y);
    doc.text('p值', margin + 135, y);
    doc.text('显著', margin + 160, y);
    y += 5;
    doc.setDrawColor(0, 212, 255, 0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;

    doc.setTextColor(180, 210, 240);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    report.activationRegions.slice(0, 8).forEach((region) => {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = margin;
        doc.setFillColor(10, 22, 40);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
      }
      doc.text(region.brainRegionName, margin, y);
      doc.text(region.volumeMm3.toLocaleString(), margin + 45, y);
      doc.text(region.peakHbO.toFixed(2), margin + 80, y);
      doc.text(region.tScore.toFixed(3), margin + 110, y);
      doc.text(region.pValue.toFixed(4), margin + 135, y);
      doc.setTextColor(region.significance ? 0 : 255, region.significance ? 255 : 138, region.significance ? 157 : 0);
      doc.text(region.significance ? '是' : '否', margin + 160, y);
      doc.setTextColor(180, 210, 240);
      y += 5;
    });

    y += 8;

    doc.setTextColor(200, 230, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('4. 光密度曲线', margin, y);
    y += 8;
    doc.setDrawColor(0, 212, 255, 0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setDrawColor(0, 212, 255);
    doc.setLineWidth(0.5);

    const chartX = margin;
    const chartY = y;
    const chartW = contentWidth;
    const chartH = 40;

    doc.setDrawColor(0, 212, 255, 0.15);
    doc.setLineWidth(0.1);
    for (let i = 0; i <= 4; i++) {
      const ly = chartY + (chartH / 4) * i;
      doc.line(chartX, ly, chartX + chartW, ly);
    }

    doc.setDrawColor(0, 212, 255);
    doc.setLineWidth(0.5);
    const points1: [number, number][] = [];
    const points2: [number, number][] = [];
    for (let i = 0; i <= 30; i++) {
      const px = chartX + (chartW / 30) * i;
      const py1 = chartY + chartH / 2 + Math.sin(i * 0.3) * (chartH / 4) + (Math.random() - 0.5) * 5;
      const py2 = chartY + chartH / 2 + Math.cos(i * 0.25) * (chartH / 5) + (Math.random() - 0.5) * 4;
      points1.push([px, py1]);
      points2.push([px, py2]);
    }
    doc.lines(points1.map(([x, yy]) => [x - chartX, yy - chartY]), chartX, chartY);
    doc.setDrawColor(0, 255, 157);
    doc.lines(points2.map(([x, yy]) => [x - chartX, yy - chartY]), chartX, chartY);

    y += chartH + 8;

    doc.setFillColor(0, 212, 255);
    doc.circle(margin + 5, y, 1.5, 'F');
    doc.setTextColor(180, 210, 240);
    doc.setFontSize(8);
    doc.text('760nm', margin + 10, y + 1);
    doc.setFillColor(0, 255, 157);
    doc.circle(margin + 35, y, 1.5, 'F');
    doc.text('850nm', margin + 40, y + 1);

    y += 10;

    doc.setTextColor(200, 230, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('5. 血氧浓度分布', margin, y);
    y += 8;
    doc.setDrawColor(0, 212, 255, 0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    const barLabels = ['Fp1', 'Fp2', 'F3', 'F4', 'C3', 'C4', 'P3', 'P4'];
    const barW = (contentWidth - 20) / barLabels.length - 4;
    const barChartH = 35;
    const barChartY = y;

    doc.setDrawColor(0, 212, 255, 0.15);
    doc.setLineWidth(0.1);
    for (let i = 0; i <= 3; i++) {
      const ly = barChartY + (barChartH / 3) * i;
      doc.line(margin, ly, pageWidth - margin, ly);
    }

    barLabels.forEach((label, i) => {
      const bx = margin + 10 + i * (barW + 4);
      const hboH = (50 + Math.random() * 40) / 100 * barChartH;
      const hbrH = (25 + Math.random() * 20) / 100 * barChartH;

      doc.setFillColor(0, 255, 157, 0.8);
      doc.roundedRect(bx, barChartY + barChartH - hboH, barW, hboH, 1, 1, 'F');

      doc.setFillColor(255, 59, 92, 0.8);
      doc.roundedRect(bx + barW / 3, barChartY + barChartH - hbrH, barW / 3, hbrH, 1, 1, 'F');

      doc.setTextColor(150, 180, 210);
      doc.setFontSize(7);
      doc.text(label, bx + barW / 2, barChartY + barChartH + 5, { align: 'center' });
    });

    y += barChartH + 12;

    doc.setFillColor(0, 255, 157);
    doc.circle(margin + 5, y, 1.5, 'F');
    doc.setTextColor(180, 210, 240);
    doc.setFontSize(8);
    doc.text('HbO', margin + 10, y + 1);
    doc.setFillColor(255, 59, 92);
    doc.circle(margin + 30, y, 1.5, 'F');
    doc.text('HbR', margin + 35, y + 1);

    y += 15;

    if (y < pageHeight - 30) {
      doc.setFillColor(0, 212, 255, 0.1);
      doc.roundedRect(margin, pageHeight - 25, contentWidth, 15, 2, 2, 'F');
      doc.setTextColor(0, 212, 255);
      doc.setFontSize(8);
      doc.text('fNIRS-SIM 脑功能成像模拟平台 · 报告自动生成', pageWidth / 2, pageHeight - 15, { align: 'center' });
    }

    const filename = `${report.taskId}_fNIRS报告_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);

    return { success: true };
  } catch (error) {
    console.error('PDF generation error:', error);
    return { success: false, message: 'PDF生成失败：' + (error as Error).message };
  }
};
