findCllsn = function(a, b) {
  function collision(a, b) {
    // top hits bottom, bottom hits top, left hits right, right hits left
    if (((a.y < b.y + b.h + 6 - b.backArea && a.y > b.y) || (a.y > b.y && a.y < b.y + b.h - b.backArea)) &&
      ((a.x + a.w > b.x && a.x + a.w < b.x + b.w) || (a.x < b.x + b.w && a.x > b.x))) {
      return true;
    } else {
      return false;
    }
  }
  for (var bi in b) {
    if (collision(a, b[bi]) && Array.isArray(b)) {
      return true;
    }
  }
};
