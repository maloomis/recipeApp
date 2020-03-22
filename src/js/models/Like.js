export default class Likes {
  constructor() {
    this.likes = [];
  }

  addLike(id, title, author, img) {
    const item = {id, title, author, img};
    this.likes.push(item);

    //Persist data in localStorage
    this.persistData();
    return item;
  }

  deleteLike(id) {
    const index = this.likes.findIndex(el => el.id === id);
    // [2,4,8] splice(1,1) -> returns 4, original array is [2,8]
    this.likes.splice(index, 1);

    this.persistData();
  }

  isLiked(id) {
    console.log(id);
    return this.likes.findIndex(el => el.id === id) !== -1;
  }

  getNumLikes() {
    return this.likes.length;
  }

  persistData() {
    localStorage.setItem('likes', JSON.stringify(this.likes));
  }

  readStorage() {
    const storage = JSON.parse(localStorage.getItem('likes'));

    // Restoring likes from the localStorage
    if (storage) this.likes = storage;
  }
}
