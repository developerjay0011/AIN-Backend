export const initialSettings = [
    { key_name: 'INSTITUTE_EMAIL', value: 'ain@awesindia.edu.in', label: 'Email Address', group_name: 'Contact' },
    { key_name: 'INSTITUTE_PHONE', value: '+91 6901299910', label: 'Phone Number', group_name: 'Contact' },
    { key_name: 'INSTITUTE_ADDRESS', value: 'C/O 151 Base Hospital, Basistha, Guwahati, Assam 781029', label: 'Full Address', group_name: 'Contact' },
    { key_name: 'INSTITUTE_MOTTO', value: 'Healing Hands, Compassionate hearts', label: 'Institute Motto', group_name: 'General' },
    { key_name: 'INSTITUTE_TAGLINE', value: "Empowering lives through healthcare excellence. North East India's premier Nursing Institute.", label: 'Institute Tagline', group_name: 'General' },
    { key_name: 'SOCIAL_FACEBOOK', value: 'https://www.facebook.com/share/18QkF38eA5/', label: 'Facebook Link', group_name: 'Social' },
    { key_name: 'SOCIAL_INSTAGRAM', value: 'https://www.instagram.com/ain_guwahati?igsh=cWZ6N2tnbWRsbWIx&utm_source=ig_contact_invite', label: 'Instagram Link', group_name: 'Social' },
    { key_name: 'GOOGLE_MAPS_EMBED_URL', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3582.835438338517!2d91.79357087581805!3d26.104289994363594!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375a5f2109f4a7b7%3A0xcf8037a4cb6df55d!2sArmy%20Institute%20of%20Nursing!5e0!3m2!1sen!2sin!4v1774261815749!5m2!1sen!2sin', label: 'Google Maps Embed URL', group_name: 'Map' },
    {
        key_name: 'AFFILIATIONS',
        value: JSON.stringify([
            { initials: 'INC', name: 'Indian Nursing Council, New Delhi', url: 'https://www.indiannursingcouncil.org', logo: 'http://localhost:5001/uploads/inc-logo.png' },
            { initials: 'ANMHVC', name: "Assam Nurses' Midwives' & Health Visitors' Council, Guwahati", url: 'https://www.assamnursingcouncil.com/', logo: 'http://localhost:5001/uploads/anmhvc-logo.png' },
            { initials: 'SSUHS', name: 'Srimanta Sankaradeva University of Health Sciences, Assam', url: 'https://ssuhs.ac.in/', logo: 'http://localhost:5001/uploads/ssuhs-logo.png' },
            { initials: 'TNAI', name: 'Trained Nurses Association of India', url: 'https://www.tnaionline.org', logo: 'http://localhost:5001/uploads/tnai-logo.png' },
            { initials: 'AWES', name: 'Army Welfare Education Society', url: 'https://www.awesindia.com/', logo: 'http://localhost:5001/uploads/awes-logo.png' }
        ]),
        label: 'Affiliations List',
        group_name: 'General',
        type: 'json'
    },
    { key_name: 'WEBSITE_LAST_UPDATED', value: '11-04-2026', label: 'Website last updated date', group_name: 'General' },
    { key_name: 'ADMIN_DASHBOARD_URL', value: 'http://localhost:5173', label: 'Admin Dashboard Base URL', group_name: 'General' },
    // { 
    //     key_name: 'ABOUT_STORY_TITLE', 
    //     value: 'About AIN', 
    //     label: 'About Story Title', 
    //     group_name: 'About Us' 
    // },
    // { 
    //     key_name: 'ABOUT_STORY_CONTENT', 
    //     value: JSON.stringify([
    //         "The Army Institute of Nursing, which was established on Aug 1, 2006 at 151 base Hospital Basistha, Guwahati, ushered in a new era of imparting professional education in nursing sciences. Guwahati being the gateway to the North Eastern Region and also the commercial hub of the region already had the requisite infrastructure for the development of an institution like the AIN. Moreover, the city being well connected to the rest of the country provided a conducive atmosphere for the infrastructural development of AIN.",
    //         "AIN's primary aim is to provide a knowledge hub in the field of nursing sciences for the female dependents of Army personnel. AIN is recognized by Indian Nursing Council, New Delhi and Assam Nurses' Midwives' & Health Visitors' Council, Guwahati. AIN is also affiliated to the Srimanta Sankaradeva University of Health Sciences, Assam."
    //     ]), 
    //     label: 'About Story Paragraphs', 
    //     group_name: 'About Us', 
    //     type: 'json' 
    // },
    // { 
    //     key_name: 'ABOUT_VISION', 
    //     value: 'Strives to provide high-quality education that integrates continuous improvement, advanced technology and cost-effective practices. It is committed to prepare nursing students to become responsible, professional and competent nurses and midwives capable of delivering promotive, preventive, curative and rehabilitative healthcare services.', 
    //     label: 'Vision Statement', 
    //     group_name: 'About Us' 
    // },
    // { 
    //     key_name: 'ABOUT_MISSION', 
    //     value: JSON.stringify([
    //         'Committed to deliver the highest standards of healthcare to all sections of society with a special focus on those who are socially and economically disadvantaged. Our goal is to nurture individuals with compassion, dedication and a spirit of service fostering professional excellence in education, research and community services.',
    //         'The Army Institute of Nursing, Guwahati is dedicated to train the student nurses in providing quality care to individuals, families and communities across the lifespan. Our students are prepared to serve in diverse healthcare settings and to take on roles as educators, counsellors, researchers and administrators in both clinical and public health settings.'
    //     ]), 
    //     label: 'Mission Paragraphs', 
    //     group_name: 'About Us', 
    //     type: 'json' 
    // },
    // { 
    //     key_name: 'ABOUT_OBJECTIVES', 
    //     value: JSON.stringify([
    //         'To provide a comprehensive system of education to impart thorough knowledge of nursing sciences with adequate practice in the field to prepare students to be highly competent and confident nurses in providing preventive, promotive and rehabilitative services in the health care setting and in community.',
    //         'To maintain the highest standards of education in nursing through an innovative and practical approach to provide service to the society.',
    //         'To develop teaching and supervisory skills in nursing, health care and administration in hospitals.'
    //     ]), 
    //     label: 'Institutional Objectives', 
    //     group_name: 'About Us', 
    //     type: 'json' 
    // },
    // { 
    //     key_name: 'ABOUT_MILESTONES', 
    //     value: JSON.stringify([
    //         { year: '2006', title: 'Institute Founded', desc: 'Army Institute of Nursing established at 151 Base Hospital, Basistha, Guwahati on August 1, 2006.' },
    //         { year: '2006', title: 'INC Recognition', desc: 'Recognized by Indian Nursing Council, New Delhi, validating our academic standards.' },
    //         { year: '2006', title: 'State Affiliation', desc: "Approved by Assam Nurses' Midwives' & Health Visitors' Council, Guwahati." },
    //         { year: '2006', title: 'University Affiliation (GU)', desc: 'Initial affiliation with Gauhati University for formal academic certification.' },
    //         { year: '2010', title: 'University Affiliation (SSUHS)', desc: 'Affiliated to Srimanta Sankaradeva University of Health Sciences, Assam.' },
    //         { year: '2015', title: 'M.Sc Programme Launch', desc: 'Post-graduate nursing programme (M.Sc Nursing) successfully launched.' }
    //     ]), 
    //     label: 'Institutional Milestones', 
    //     group_name: 'About Us', 
    //     type: 'json' 
    // },
    // { 
    //     key_name: 'LEADERSHIP_MESSAGES', 
    //     value: JSON.stringify([
    //         {
    //             role: 'Director',
    //             name: 'Brig Ajit Kumar Borah, VSM (Retd)',
    //             quote: '"Excellence in nursing is not merely a goal — it is a commitment to serve with dedication, devotion and diligence. At AIN, we nurture this commitment in every student."',
    //             body: 'It is with great pride that we continue to build on the legacy of the Army Institute of Nursing. Our institute stands as a beacon of quality nursing education in Northeast India, committed to producing compassionate and competent healthcare professionals who serve the nation.',
    //             image: 'http://localhost:5001/uploads/director.jpeg'
    //         },
    //         {
    //             role: 'Officiating Principal',
    //             name: 'Prof. Kabita Baishya',
    //             quote: '"Our goal is to shape nurses who are not just clinically competent but are equipped with moral values and a spirit of selfless service."',
    //             body: 'The Army Institute of Nursing is dedicated to academic excellence and holistic nursing education. We integrate rigorous theory with extensive clinical practice, ensuring our graduates are well-prepared for the challenges of modern healthcare, both in military and civilian settings.',
    //             image: 'http://localhost:5001/uploads/principal.jpeg'
    //         },
    //         {
    //             role: 'Registrar',
    //             name: 'Col Jyoti Prasad Saikia (Retd)',
    //             quote: '"Administration at AIN is built on transparency, discipline, and unwavering support for our students\' academic journey."',
    //             body: 'Our administrative systems are designed to provide seamless support to students and faculty alike. From admissions to examinations, we ensure every process is carried out with efficiency and integrity, in line with INC and university guidelines.',
    //             image: 'http://localhost:5001/uploads/registrar.jpeg'
    //         }
    //     ]), 
    //     label: 'Leadership Messages', 
    //     group_name: 'About Us', 
    //     type: 'json' 
    // }
];
