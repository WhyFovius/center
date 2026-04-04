import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, CheckCircle, AlertCircle, Award, Calendar, Mail, Building, User } from 'lucide-react';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import { useGS } from '@/store/useGS';
import { t } from '@/lib/i18n';

interface CertificateForm {
  fullName: string;
  company: string;
  email: string;
  date: string;
}

interface CertificateGeneratorProps {
  onClose: () => void;
}

export default function CertificateGenerator({ onClose }: CertificateGeneratorProps) {
  const lang = useGS(s => s.lang);
  const T = (key: string) => t(lang, key);
  const [form, setForm] = useState<CertificateForm>({
    fullName: '',
    company: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CertificateForm, string>>>({});
  const [generated, setGenerated] = useState(false);
  const [certificateId, setCertificateId] = useState('');

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CertificateForm, string>> = {};
    if (!form.fullName.trim()) newErrors.fullName = T('osCertValidationError');
    if (!form.company.trim()) newErrors.company = T('osCertValidationError');
    if (!form.email.trim() || !form.email.includes('@')) newErrors.email = T('osCertValidationError');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateCertificateId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 8);
    return `ZD-${timestamp}-${random}`.toUpperCase();
  };

  const generatePDF = () => {
    if (!validate()) return;

    const certId = generateCertificateId();
    setCertificateId(certId);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Border
    doc.setDrawColor(63, 185, 80);
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    doc.setDrawColor(63, 185, 80);
    doc.setLineWidth(0.5);
    doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

    // Header accent line
    doc.setFillColor(63, 185, 80);
    doc.rect(10, 10, pageWidth - 20, 4, 'F');

    // Logo text
    doc.setFontSize(36);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text('Zero', pageWidth / 2 - 40, 45);
    doc.setTextColor(63, 185, 80);
    doc.text('Day', pageWidth / 2 + 5, 45);

    // Certificate title
    doc.setFontSize(22);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(T('osCertificate'), pageWidth / 2, 60, { align: 'center' });

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.text('Pixel Minds Team', pageWidth / 2, 68, { align: 'center' });

    // Divider
    doc.setDrawColor(63, 185, 80);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 60, 75, pageWidth / 2 + 60, 75);

    // Award icon
    doc.setFontSize(20);
    doc.text('🛡️', pageWidth / 2 - 5, 90);

    // "Awarded to" text
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(T('osCertAwardedTo'), pageWidth / 2, 105, { align: 'center' });

    // Full name
    doc.setFontSize(28);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(form.fullName, pageWidth / 2, 118, { align: 'center' });

    // Company
    doc.setFontSize(13);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(`${T('osCertCompany')}: ${form.company}`, pageWidth / 2, 130, { align: 'center' });

    // Completion text
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(T('osCertCompletion'), pageWidth / 2, 142, { align: 'center' });

    // All 12 tasks
    doc.setFontSize(10);
    doc.setTextColor(63, 185, 80);
    doc.text(T('osAllTasksComplete'), pageWidth / 2, 150, { align: 'center' });

    // Date and email row
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`${T('osCertDate')}: ${form.date}`, pageWidth / 2 - 40, 165, { align: 'center' });
    doc.text(`${T('osCertEmail')}: ${form.email}`, pageWidth / 2 + 40, 165, { align: 'center' });

    // Certificate ID
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`ID: ${certId}`, pageWidth / 2, 175, { align: 'center' });

    // QR Code
    const qrUrl = `${window.location.origin}/validate?cert=${certId}`;
    const qrSize = 30;
    const qrX = pageWidth - 50;
    const qrY = pageHeight - 55;
    
    // Generate QR as SVG then add to PDF
    doc.addImage(
      generateQRImage(qrUrl),
      'PNG',
      qrX,
      qrY,
      qrSize,
      qrSize
    );

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Scan to validate', qrX + qrSize / 2, qrY + qrSize + 4, { align: 'center' });

    // Signature
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'bolditalic');
    doc.text('Pixel Minds Team', 40, pageHeight - 45);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('________________________', 30, pageHeight - 43);
    doc.text('Authorized Signature', 30, pageHeight - 38);

    // Footer
    doc.setFillColor(63, 185, 80);
    doc.rect(10, pageHeight - 20, pageWidth - 20, 10, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('ZeroDay Cybersecurity Training Platform • pixelminds.team', pageWidth / 2, pageHeight - 13, { align: 'center' });

    // Save
    doc.save(`certificate_${certId}.pdf`);
    setGenerated(true);
  };

  // Generate a simple QR placeholder (actual QR rendering in PDF is complex)
  const generateQRImage = (_url: string): string => {
    // Return a simple transparent pixel - the QR code will be rendered separately
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  };

  const handleInputChange = (field: keyof CertificateForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6" style={{ color: '#3fb950' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{T('osCertificate')}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors">
            <X className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {!generated ? (
            <>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {T('osCertDescription')}
              </p>

              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  <User className="w-3.5 h-3.5" /> {T('osCertTitle')} *
                </label>
                <input
                  value={form.fullName}
                  onChange={e => handleInputChange('fullName', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
                    errors.fullName ? 'border-red-500' : 'focus:border-green-500'
                  }`}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                  placeholder="Иванов Иван Иванович"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Company */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  <Building className="w-3.5 h-3.5" /> {T('osCertCompany')} *
                </label>
                <input
                  value={form.company}
                  onChange={e => handleInputChange('company', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
                    errors.company ? 'border-red-500' : 'focus:border-green-500'
                  }`}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                  placeholder="ООО Компания"
                />
                {errors.company && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.company}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  <Mail className="w-3.5 h-3.5" /> {T('osCertEmail')} *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
                    errors.email ? 'border-red-500' : 'focus:border-green-500'
                  }`}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  <Calendar className="w-3.5 h-3.5" /> {T('osCertDate')}
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => handleInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:border-green-500 transition-colors"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                />
              </div>

              {/* Generate button */}
              <button
                onClick={generatePDF}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors hover:opacity-90"
                style={{ backgroundColor: '#3fb950' }}
              >
                <Download className="w-4 h-4" /> {T('osCertGenerate')}
              </button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-green-500/15">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{T('osCertSuccess')}</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                ID: {certificateId}
              </p>

              {/* QR Code display */}
              <div className="flex justify-center p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg)' }}>
                <QRCodeSVG
                  value={`${window.location.origin}/validate?cert=${certificateId}`}
                  size={120}
                  level="M"
                />
              </div>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                Отсканируйте для валидации сертификата
              </p>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: '#3fb950' }}
              >
                {T('osContinue')}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
