function loadUser(user) {
  if (user && user.name) {
    var keys = ['name', 'pro'];
    $('.loggedout').hide();
    var menu = $('.loggedin').show();
    var html = $('#profile-template').text();
    var $html = $(html.replace(/({.*?})/g, function (all, match) {
      var key = match.slice(1, -1).trim(); // ditch the wrappers
      keys.push(key);
      return user[key] || '';
    }));
    if (user.pro) {
      document.documentElement.className += ' pro';
      $html.find('.gopro').remove();
    } else {
      $html.find('.pro').remove();
    }
    var $menu = menu.append($html);
    try {
      localStorage.setItem('jsbin.user', JSON.stringify(keys.reduce(function (acc, curr) {
        acc[curr] = user[curr];
        return acc;
      }, {})))
    } catch (e) {}
  } else {
    $('.loggedout').show();
  }
}