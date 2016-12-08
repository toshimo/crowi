/**
 * Crowi context class for client
 */

import axios from 'axios'

export default class Crowi {
  constructor(context, window) {
    this.context = context;

    this.location = window.location || {};
    this.document = window.document || {};
    this.localStorage = window.localStorage || {};

    this.fetchUsers = this.fetchUsers.bind(this);
    this.apiGet = this.apiGet.bind(this);
    this.apiPost = this.apiPost.bind(this);
    this.apiRequest = this.apiRequest.bind(this);

    // FIXME
    this.me = context.me;

    this.users = [];
    this.userByName = {};
    this.draft = {};

    this.recoverData();
  }

  getContext() {
    return context;
  }

  recoverData() {
    const keys = [
      'userByName',
      'users',
      'draft',
    ];

    keys.forEach(key => {
      if (this.localStorage[key]) {
        try {
          this[key] = JSON.parse(this.localStorage[key]);
        } catch (e) {
          this.localStorage.removeItem(key);
        }
      }
    });
  }

  fetchUsers () {
    const interval = 1000*60*10; // 5min
    const currentTime = new Date();
    if (!this.localStorage.lastFetched && interval > currentTime - new Date(this.localStorage.lastFetched)) {
      return ;
    }

    this.apiGet('/users.list', {})
    .then(data => {
      this.users = data.users;
      this.localStorage.users = JSON.stringify(data.users);

      let userByName = {};
      for (let i = 0; i < data.users.length; i++) {
        const user = data.users[i];
        userByName[user.username] = user;
      }
      this.userByName = userByName;
      this.localStorage.userByName = JSON.stringify(userByName);

      this.localStorage.lastFetched = new Date();
    }).catch(err => {
      this.localStorage.removeItem('lastFetched');
      // ignore errors
    });
  }

  clearDraft(path) {
    delete this.draft[path];
    this.localStorage.draft = JSON.stringify(this.draft);
  }

  saveDraft(path, body) {
    this.draft[path] = body;
    this.localStorage.draft = JSON.stringify(this.draft);
  }

  findDraft(path) {
    if (this.draft && this.draft[path]) {
      return this.draft[path];
    }

    return null;
  }

  findUserByEmail(email) {
    // FIME: calculation order
    for (let i = 0; i < data.users.length; i++) {
      const user = data.users[i];
      if (user.email && user.email == email) {
        return user;
      }
    }

    return null;
  }

  findUser(username) {
    if (this.userByName && this.userByName[username]) {
      return this.userByName[username];
    }

    return null;
  }

  apiGet(path, params) {
    return this.apiRequest('get', path, params);
  }

  apiPost(path, params) {
    return this.apiRequest('post', path, params);
  }

  apiRequest(method, path, params) {
    return new Promise((resolve, reject) => {
      axios[method](`/_api${path}`, {params})
      .then(res => {
        if (res.data.ok) {
          resolve(res.data);
        } else {
          // FIXME?
          reject(new Error(res.data));
        }
      }).catch(res => {
          // FIXME?
        reject(new Error('Error'));
      });
    });
  }

  static escape (html, encode) {
    return html
      .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  static unescape(html) {
    return html.replace(/&([#\w]+);/g, function(_, n) {
      n = n.toLowerCase();
      if (n === 'colon') return ':';
      if (n.charAt(0) === '#') {
        return n.charAt(1) === 'x'
          ? String.fromCharCode(parseInt(n.substring(2), 16))
          : String.fromCharCode(+n.substring(1));
      }
      return '';
    });
  }
}

