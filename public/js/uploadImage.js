//Function that takes the user uploaded image file, then stores it as a 64bit url I think
async function uploadImage()
{
    var data = new FormData();
    const tempImage = document.getElementById('file').files[0];
    console.log(`TempImage = ${tempImage}`);
    data.append("title", document.getElementById('title').value);
    data.append("image", tempImage);

    //Call path to post the saved data to the database
    try {
        const res = await fetch('http://40.122.146.213/gallery', {
            method: 'POST',
            body: data
        });
        console.log(`Res.status = ${res.status}`)
        if (res.status === 403) {
            alert("You can't do that");
        } else if (res.status === 200) {
            //TODO Success Message!
            console.log(`${data.title} successfully added to the database!`);
            alert(`${data.title} successfully added to the database!`);
        }
    } catch (err) {
        console.log(err);
    }
}