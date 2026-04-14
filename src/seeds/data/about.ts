export const initialAboutSettings = [
    { 
        key_name: 'ABOUT_MILESTONES', 
        value: JSON.stringify([
            { year: '2006', title: 'Institute Founded', desc: 'Army Institute of Nursing established at 151 Base Hospital, Basistha, Guwahati on August 1, 2006.' },
            { year: '2006', title: 'INC Recognition', desc: 'Recognized by Indian Nursing Council, New Delhi, validating our academic standards.' },
            { year: '2006', title: 'State Affiliation', desc: "Approved by Assam Nurses' Midwives' & Health Visitors' Council, Guwahati." },
            { year: '2006', title: 'University Affiliation (GU)', desc: 'Initial affiliation with Gauhati University for formal academic certification.' },
            { year: '2010', title: 'University Affiliation (SSUHS)', desc: 'Affiliated to Srimanta Sankaradeva University of Health Sciences, Assam.' },
            { year: '2015', title: 'M.Sc Programme Launch', desc: 'Post-graduate nursing programme (M.Sc Nursing) successfully launched.' },
        ]), 
        label: 'Institutional Milestones', 
        group_name: 'About Us', 
        type: 'json' 
    },
    { 
        key_name: 'DIRECTOR_MESSAGE', 
        value: JSON.stringify({
            quote: '"Excellence in nursing is not merely a goal — it is a commitment to serve with dedication, devotion and diligence. At AIN, we nurture this commitment in every student."',
            body: 'It is with great pride that we continue to build on the legacy of the Army Institute of Nursing. Our institute stands as a beacon of quality nursing education in Northeast India, committed to producing compassionate and competent healthcare professionals who serve the nation.',
        }), 
        label: "Director's Message", 
        group_name: 'About Us', 
        type: 'json' 
    },
    { 
        key_name: 'PRINCIPAL_MESSAGE', 
        value: JSON.stringify({
            quote: '"Our goal is to shape nurses who are not just clinically competent but are equipped with moral values and a spirit of selfless service."',
            body: 'The Army Institute of Nursing is dedicated to academic excellence and holistic nursing education. We integrate rigorous theory with extensive clinical practice, ensuring our graduates are well-prepared for the challenges of modern healthcare, both in military and civilian settings.',
        }), 
        label: "Principal's Message", 
        group_name: 'About Us', 
        type: 'json' 
    },
    { 
        key_name: 'REGISTRAR_MESSAGE', 
        value: JSON.stringify({
            quote: '"Administration at AIN is built on transparency, discipline, and unwavering support for our students\' academic journey."',
            body: 'Our administrative systems are designed to provide seamless support to students and faculty alike. From admissions to examinations, we ensure every process is carried out with efficiency and integrity, in line with INC and university guidelines.',
        }), 
        label: "Registrar's Message", 
        group_name: 'About Us', 
        type: 'json' 
    }
];
