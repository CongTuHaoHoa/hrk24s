module.exports.google = async access_token =>
{
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${ access_token }` }});
    const { name, email, picture, sub } = await response.json()
    return { google: sub, googleMail: email, googleName: name, googlePicture: picture }
}

module.exports.facebook = async access_token =>
{
    const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${access_token}`);
    const { id, name, email, picture} = await response.json()
    return { facebook: id, facebookMail: email, facebookName: name, facebookPicture: picture.data.url }
}