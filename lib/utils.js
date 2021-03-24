
/**
 * 将下划线命名转驼峰
 * @param {*} str 
 * @returns 
 */
exports.toHump = str => {
  return str.replace(/\_+(\w)|\_$/g, function(_, letter,i){
      if(i==0) return letter;
      if(!letter || letter === '_') return '';
      return letter.toUpperCase();
  });
}
