export async function sendMailDev(to, subject, body) {
    // Dev only: just log to server console
    console.log('--- DEV MAIL ---');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:\n', body);
    console.log('---------------');
}
