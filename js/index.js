/* ============ get data from vk ============= */
function authVK() {
    return new Promise( resolve => {
        if (document.readyState ==='complete') {
        resolve();
        } else {
            window.onload = resolve;
        }}).then(() => new Promise((resolve, reject) => {
            VK.init({
                apiId: 6489559
        });
        
        VK.Auth.login(response => {
            if (response.session) {
            resolve(response);
            } else {
                reject(new Error('Не удалось авторизоваться'));
            }
        }, 2);
}));
}

function callApi(method, params) {
    params.v = '5.78';

    return new Promise((resolve,reject) => {
        VK.api(method, params, (data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);                
            }
        });
    });
}

(async () => {
    try {
        await authVK();
        const friends = await callApi('friends.get', {fields: 'photo_50'});
        localStorage.data = JSON.stringify(friends);
    } catch(e) {
        console.log(e);
    }
})();

const friendsList = document.getElementById('friends');
const choosenList = document.getElementById('choosen');
const mainContent = document.querySelector('.ff_main_content');
const search = document.querySelector('.ff_main_search');
let choosenFriends = [];
let friends = [];
let filteredFriends = [];
let filteredChoosen = [];


/* ====== render ====== */

function renderList(obj, parent) {
    obj.sort((a, b) => {
        let textA = a.last_name.toUpperCase();
        let textB = b.last_name.toUpperCase();

        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    obj = (parent.parentNode.className.includes('left')) ? obj.filter(item => filterByName(item, search.children[0].value)) : obj;
    obj = (parent.parentNode.className.includes('right')) ? obj.filter(item => filterByName(item, search.children[1].value)) : obj;    
    parent.innerHTML = '';
    for (let {id, first_name, last_name, photo_50} of obj) {
        const li = document.createElement('li');
        li.draggable = true;
        li.id = id;
        const img = document.createElement('img');
        img.src = photo_50;
        img.className = 'photo';
        const nameDiv = document.createElement('div');
        nameDiv.className = 'name';
        const name = document.createElement('span');
        name.textContent = `${last_name} ${first_name}`;                
        const button = document.createElement('i');
        button.className = (parent.id === 'friends') ? 'flaticon-add' : 'flaticon-delete';
        nameDiv.appendChild(img);        
        nameDiv.appendChild(name); 
        li.appendChild(nameDiv);
        li.appendChild(button);    

        parent.appendChild(li);
    }    
}

if (!localStorage.dataSave) {
    friends = JSON.parse(localStorage.data).items;
    renderList(friends, friendsList);
} else {
    friends = JSON.parse(localStorage.friends);
    choosenFriends = JSON.parse(localStorage.choosenFriends);
    renderList(friends, friendsList);
    renderList(choosenFriends, choosenList);         
}

/* ========filtration======== */

function filterByName (item, chunk) {
    let fullName = `${item.first_name} ${item.last_name}`;

    return fullName.toLowerCase().includes(chunk.toLowerCase())
}

search.addEventListener('keyup', event => {
    let input = event.target;
    switch (input.className) {
        case 'ff_main_search-left':
            filteredFriends = friends.filter(item => filterByName(item, input.value));                
            renderList(filteredFriends, friendsList);
            break;
        case 'ff_main_search-right':
            filteredChoosen = choosenFriends.filter(item => filterByName(item, input.value));                
            renderList(filteredChoosen, choosenList);
            break;
        }
    }
);

/* ========== adding items by button =========== */

function addFriend(id, from, to) {
    for (let i = 0; i < from.length; i++) {
        if (from[i].id === Number.parseInt(id)) {
        let friend = from.splice(i, 1)[0];
        to.push(friend);
        };
    }
}

mainContent.addEventListener('click', event => {
    let id = event.target.parentNode.id;            
    switch(event.target.className) {
        case 'flaticon-add':
            addFriend(id, friends, choosenFriends);
            break;
        case 'flaticon-delete':
            addFriend(id, choosenFriends, friends);
            break;
        }
    renderList(friends, friendsList);    
    renderList(choosenFriends, choosenList);
})

/* ============= save data ========== */

let saveButton = document.querySelector('.ff_main_footer-button');

saveButton.addEventListener('click', event => {
    localStorage.dataSave = 'true';
    localStorage.friends = JSON.stringify(friends);
    localStorage.choosenFriends = JSON.stringify(choosenFriends);
    alert('data saved');
});

/* ======= drag n drop =======*/

function makeDnD(zones) {
    let currentDrag;

    zones.forEach(zone => {
        zone.addEventListener('dragstart', (e) => {
            currentDrag = { source: zone, node: e.target };
        });

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        zone.addEventListener('drop', (e) => {
            if (currentDrag) {
                e.preventDefault();

                if (currentDrag.source !== zone) {
                    switch (currentDrag.source.id) {
                        case 'friends':
                            addFriend(currentDrag.node.id, friends, choosenFriends);
                            break;
                        case 'choosen':
                            addFriend(currentDrag.node.id, choosenFriends, friends);
                            break;    
                    }
                    renderList(friends, friendsList);    
                    renderList(choosenFriends, choosenList);    
                }
                currentDrag = null;
            }
        });
    })
}

makeDnD([friendsList,choosenList]);