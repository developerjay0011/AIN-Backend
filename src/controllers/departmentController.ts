import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeString } from '../utils/sanitize.js';
import { formatDataUrls } from '../utils/urlHelper.js';

// const departments = [
//   {
//     id: 'child-health',
//     name: 'Child Health Nursing',
//     shortName: 'CHN',
//     icon: Baby,
//     color: 'from-blue-50 to-cyan-50 border-blue-100',
//     iconBg: 'bg-blue-100',
//     iconColor: 'text-blue-600',
//     overview:
//       'The Department of Child Health Nursing focuses on the holistic care of children from neonatal stage through adolescence. Students gain in-depth knowledge of paediatric illnesses, growth & development, immunisation, and family-centred care.',
//     areas: [
//       'Neonatal Nursing & Care of the Newborn',
//       'Paediatric Medical & Surgical Nursing',
//       'Growth Monitoring & Child Development',
//       'Immunisation & Preventive Paediatrics',
//       'Family-Centred & Community Child Care',
//     ],
//     faculty: 3,
//     clinicalHours: '480 hrs',
//   },
//   {
//     id: 'community-health',
//     name: 'Community Health Nursing',
//     shortName: 'ComHN',
//     icon: Users,
//     color: 'from-green-50 to-emerald-50 border-green-100',
//     iconBg: 'bg-green-100',
//     iconColor: 'text-green-700',
//     overview:
//       'The Department of Community Health Nursing equips students with the skills to deliver preventive, promotive, and rehabilitative healthcare services to the community. Emphasis is placed on primary healthcare, epidemiology, and community outreach programmes.',
//     areas: [
//       'Primary Healthcare & District Health Systems',
//       'Epidemiology & Disease Surveillance',
//       'Maternal & Child Health in Community',
//       'National Health Programmes',
//       'Community Outreach & Home Visits',
//     ],
//     faculty: 3,
//     clinicalHours: '400 hrs',
//   },
//   {
//     id: 'msn',
//     name: 'MSN – Medical Surgical Nursing',
//     shortName: 'MSN',
//     icon: BookOpen,
//     color: 'from-purple-50 to-violet-50 border-purple-100',
//     iconBg: 'bg-purple-100',
//     iconColor: 'text-purple-700',
//     overview:
//       'The Medical-Surgical Nursing (MSN) department provides a strong evidence-based foundation in adult clinical nursing. Students are trained in managing patients with a wide range of medical and surgical conditions across hospital settings.',
//     areas: [
//       'Fundamentals of Nursing Practice',
//       'Medical Nursing – Systemic Disorders',
//       'Surgical Nursing – Pre & Post-Operative Care',
//       'Critical Care & Emergency Nursing',
//       'Pharmacology & Drug Administration',
//     ],
//     faculty: 4,
//     clinicalHours: '560 hrs',
//   },
//   {
//     id: 'mhn',
//     name: 'MHN – Mental Health Nursing',
//     shortName: 'MHN',
//     icon: Brain,
//     color: 'from-rose-50 to-pink-50 border-rose-100',
//     iconBg: 'bg-rose-100',
//     iconColor: 'text-rose-600',
//     overview:
//       'The Mental Health Nursing (MHN) department prepares students to provide compassionate, evidence-based psychiatric and mental healthcare. The curriculum emphasises therapeutic communication, psychopathology, and community mental health.',
//     areas: [
//       'Concepts of Mental Health & Illness',
//       'Psychopathology & Clinical Psychiatry',
//       'Therapeutic Relationships & Communication',
//       'Psychopharmacology & Somatic Therapies',
//       'Community Mental Health & Rehabilitation',
//     ],
//     faculty: 2,
//     clinicalHours: '320 hrs',
//   },
//   {
//     id: 'obg',
//     name: 'OBG – Obstetric & Gynaecological Nursing',
//     shortName: 'OBG',
//     icon: Heart,
//     color: 'from-orange-50 to-amber-50 border-orange-100',
//     iconBg: 'bg-orange-100',
//     iconColor: 'text-orange-600',
//     overview:
//       'The Obstetrics & Gynaecology Nursing (OBG) department trains students in the complete spectrum of women\'s health — from antenatal to postnatal care and gynaecological conditions. Students gain hands-on experience in labour wards and maternity units.',
//     areas: [
//       'Antenatal, Intranatal & Postnatal Care',
//       'Normal & Complicated Labour Management',
//       'Neonatal Care & Breastfeeding Promotion',
//       'Gynaecological Nursing & Reproductive Health',
//       'High-Risk Pregnancy & Emergency Obstetrics',
//     ],
//     faculty: 3,
//     clinicalHours: '480 hrs',
//   },
// ];

const INITIAL_DEPARTMENTS = [
  {
    departmentId: 'child-health',
    name: 'Child Health Nursing',
    shortName: 'CHN',
    overview: 'The Department of Child Health Nursing focuses on the holistic care of children from neonatal stage through adolescence. Students gain in-depth knowledge of paediatric illnesses, growth & development, immunisation, and family-centred care.',
    areas: JSON.stringify([
      'Neonatal Nursing & Care of the Newborn',
      'Paediatric Medical & Surgical Nursing',
      'Growth Monitoring & Child Development',
      'Immunisation & Preventive Paediatrics',
      'Family-Centred & Community Child Care',
    ]),
    faculty: 3,
    clinicalHours: '480 hrs',
  },
  {
    departmentId: 'community-health',
    name: 'Community Health Nursing',
    shortName: 'ComHN',
    overview: 'The Department of Community Health Nursing equips students with the skills to deliver preventive, promotive, and rehabilitative healthcare services to the community. Emphasis is placed on primary healthcare, epidemiology, and community outreach programmes.',
    areas: JSON.stringify([
      'Primary Healthcare & District Health Systems',
      'Epidemiology & Disease Surveillance',
      'Maternal & Child Health in Community',
      'National Health Programmes',
      'Community Outreach & Home Visits',
    ]),
    faculty: 3,
    clinicalHours: '400 hrs',
  },
  {
    departmentId: 'msn',
    name: 'MSN – Medical Surgical Nursing',
    shortName: 'MSN',
    overview: 'The Medical-Surgical Nursing (MSN) department provides a strong evidence-based foundation in adult clinical nursing. Students are trained in managing patients with a wide range of medical and surgical conditions across hospital settings.',
    areas: JSON.stringify([
      'Fundamentals of Nursing Practice',
      'Medical Nursing – Systemic Disorders',
      'Surgical Nursing – Pre & Post-Operative Care',
      'Critical Care & Emergency Nursing',
      'Pharmacology & Drug Administration',
    ]),
    faculty: 4,
    clinicalHours: '560 hrs',
  },
  {
    departmentId: 'mhn',
    name: 'MHN – Mental Health Nursing',
    shortName: 'MHN',
    overview: 'The Mental Health Nursing (MHN) department prepares students to provide compassionate, evidence-based psychiatric and mental healthcare. The curriculum emphasises therapeutic communication, psychopathology, and community mental health.',
    areas: JSON.stringify([
      'Concepts of Mental Health & Illness',
      'Psychopathology & Clinical Psychiatry',
      'Therapeutic Relationships & Communication',
      'Psychopharmacology & Somatic Therapies',
      'Community Mental Health & Rehabilitation',
    ]),
    faculty: 2,
    clinicalHours: '320 hrs',
  },
  {
    departmentId: 'obg',
    name: 'OBG – Obstetric & Gynaecological Nursing',
    shortName: 'OBG',
    overview: 'The Obstetrics & Gynaecology Nursing (OBG) department trains students in the complete spectrum of women\'s health — from antenatal to postnatal care and gynaecological conditions. Students gain hands-on experience in labour wards and maternity units.',
    areas: JSON.stringify([
      'Antenatal, Intranatal & Postnatal Care',
      'Normal & Complicated Labour Management',
      'Neonatal Care & Breastfeeding Promotion',
      'Gynaecological Nursing & Reproductive Health',
      'High-Risk Pregnancy & Emergency Obstetrics',
    ]),
    faculty: 3,
    clinicalHours: '480 hrs',
  }
];

// Helper to ensure table exists
const ensureTableExists = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS departments (
            id VARCHAR(255) PRIMARY KEY,
            departmentId VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            shortName VARCHAR(100) NOT NULL,
            overview TEXT,
            areas TEXT,
            faculty INT DEFAULT 0,
            clinicalHours VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

  // Auto-cleanup the explicitly removed 'nf' department if it was seeded previously
  await pool.query("DELETE FROM departments WHERE departmentId = 'nf'");
};

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureTableExists();

    let [departments] = await pool.query('SELECT * FROM departments');
    let deptRows = departments as any[];

    // Auto-seed if empty
    if (deptRows.length === 0) {
      for (const d of INITIAL_DEPARTMENTS) {
        const id = `DEPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await pool.query(
          'INSERT INTO departments (id, departmentId, name, shortName, overview, areas, faculty, clinicalHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [id, d.departmentId, d.name, d.shortName, d.overview, d.areas, d.faculty, d.clinicalHours]
        );
      }
      const [newDepts] = await pool.query('SELECT * FROM departments');
      deptRows = newDepts as any[];
    }

    // Parse JSON
    const parsedDepts = deptRows.map(row => ({
      ...row,
      _id: row.id, // compatibility attribute for frontend
      areas: typeof row.areas === 'string' ? JSON.parse(row.areas) : row.areas
    }));

    res.json(formatDataUrls(parsedDepts));
  } catch (error) {
    console.error('Error in getDepartments:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const name = sanitizeString(req.body.name);
    const shortName = sanitizeString(req.body.shortName);
    const overview = sanitizeString(req.body.overview);
    const faculty = req.body.faculty;
    const clinicalHours = sanitizeString(req.body.clinicalHours);
    let { areas } = req.body;

    if (Array.isArray(areas)) {
      areas = JSON.stringify(areas.map(a => sanitizeString(a)));
    } else if (typeof areas === 'string') {
      areas = sanitizeString(areas);
    }

    await pool.query(
      'UPDATE departments SET name = ?, shortName = ?, overview = ?, areas = ?, faculty = ?, clinicalHours = ? WHERE id = ?',
      [name, shortName, overview, areas, faculty, clinicalHours, id]
    );

    const [updated] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);
    const updatedRow = (updated as any[])[0];

    if (!updatedRow) {
      res.status(404).json({ message: 'Department not found' });
      return;
    }

    const result = {
      ...updatedRow,
      _id: updatedRow.id,
      areas: typeof updatedRow.areas === 'string' ? JSON.parse(updatedRow.areas) : updatedRow.areas
    };

    res.json(formatDataUrls(result));
  } catch (error) {
    console.error('Error in updateDepartment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
