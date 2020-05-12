//Call the images JSON array from the database

var Gallery = 
{
    username: "none",
    currentPage: 1,
    totalPages: 1,
    numberOfImages: 0,
    imageList: [],
    imageSrcList: [],

    setData: function()
    {
        var url = window.location.pathname;
        this.username = url.substring(url.lastIndexOf('/') + 1);
        console.log(`Before Fetch`);
        //Requests image JSON from server
            fetch(`http://40.122.146.213/gallery/${this.username}`, {
                method: 'GET'
            }).then( res => {
                console.log(res)
                return res.json();
            }).then( data => {

                //Waits for reply, then populates the imageList array with loaded images
                imageList = data.images;
                // log the data
                console.log(data);

                //Calculate Number of Pages
                this.numberOfImages = length(data.images);
                this.totalPages = ceil(this.numberOfImages / 4);
            }).catch( err => {
                console.log(err);
            });
            console.log(`After Fetch`);
        

        //Generate Image URLs for each image in imageList
        for (var i=0; i < this.imageList.length;i++)
        {
            //img.src     = URL.createObjectURL(img);   //Template
            this.imageSrcList[i] = URL.createObjectURL(this.imageList[i].image);
        }
        
        /*fetch('http://40.122.146.213/gallery/:username', {
            method: 'GET'
        }).then( res => {
            console.log(res)
            return res.json();
        }).then( data => {
            // log the data
            console.log(data);
            image_list = data.keywords;
        }).catch( err => {
            console.log(err);
        });*/

        this.render();
    },

    render: function()
    {
        //Generate new html/css code for the imageGrid div
        console.log('Rendering Beginning . . .');

        //Create Temporary Variables to resize Grid appropriately
        var tableWidth = 100;
        var imageWidth = tableWidth/100 * (screen.width/4);
        console.log(`Table Width: ${tableWidth}%`);
        console.log(`Image Width: ${imageWidth}px`);

        //Create Temp String that will contain everything, initialize it to nonlooping beginning of html
        var tempHTML = `<style>
        .imageTable {
        margin-left:auto; 
        margin-right:auto;
        border-spacing: 0;
        border-collapse: collapse;
        width:${tableWidth}%;
        }
        
        .imageTable tr, .imageTable td {
        border: none;
        padding: 0px;
        vertical-align: top;
        position: relative;
        width: ${imageWidth}px;
        height: ${imageWidth}px; 
        }
        </style>
        <table class="imageTable"'> 
            <tbody>
                <tr>`;
                //Create a temp iterator that tracks how many images are left to display total
                imagesDisplayed = 0;

                //For Each Image
                for (var i = ((this.currentPage-1) * 4); i < (this.currentPage * 4);i++)
                {
                    tempHTML += `<td>`;
                    //Draw the Image
                    tempHTML += `<img src="${this.imageSrcList[i]}">`;
                    tempHTML += `</td>`;
                }
        tempHTML += `</tr>
                </tbody>
        </table>`;

        document.getElementById("imageGrid").innerHTML = tempHTML;
        console.log('Rendering Complete.');
        },

    loadNextPage: function()
    {
        //Cycles to the next page of images
        if (this.currentPage < this.totalPages)
        {
            this.currentPage++;
            this.render();
        }
        console.log(`Current Page: ${this.currentPage}`);
    },

    loadPreviousPage: function()
    {
        //Cycles to the previous page of images
        if (this.currentPage > 1)
        {
            this.currentPage--;
            this.render();
            console.log(`Current Page: ${this.currentPage}`);
        }
    }
}