/**
 * Exports log screen as image.
 *
 * @author Shadrachp
 * @dependencies vergil.js, html2canvas.min.js
**/

//id of element. Element which would trigger this function
const capture = (id, target, filename) => {
    html2canvas(target, {
        dpi: 120,
        onrendered: (canvas)=>{
            document.getElementById(id).attr('href', canvas.toDataURL("image/png"));
            document.getElementById(id).attr('download', filename + '.png');
            vergil("<div style=color:var(--success);>"+
                   "successfully exported "+ filename
                   "</div>", 1800);
        }
    });
}
