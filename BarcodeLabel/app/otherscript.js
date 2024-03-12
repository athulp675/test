           // Event delegation for the "Print" buttons
           const contentDiv = document.getElementById('content');
           const printButton = document.getElementById('print-button');
           $('#table-body').on('click', '.print-button', function () {
               // Find the closest <tr> element and then find the <td> with Batch ID
              // const batchSerialNumber = row.querySelector('td:nth-child(2)').textContent;
               const batchId = $(this).closest('tr').find('td:nth-child(2)').text();
               console.log('Batch ID:', batchId);
               ///collect all batch details///
               dispbatch.forEach(data =>{
                   var dbatch_serial = data.Batch_Serial_Number.display_value;
                   if(dbatch_serial == batchId)
                   {
                       var dsku = data.SKU.display_value;
                       var spaces = "   ";
                       var newb = dsku+spaces+batchId;
                       ///Print content concatinate in a long string///
                       //var start =  '\x02'+'m\n'+'\x02L\nD11\nH18';
                       var start =  '~m|\n'+'~L|\nD11|\nH18|';
                       var printcode = "\n191100201900060"+itemcode+"|\n191100201600060"+colrcode+"|\n191100201300060"+codeonly+"|\n191100300900060"+newb+"|\n191100200600070 SA-"+salesperson+" TB-"+staff+"|\n191100200300040 CL "+sodetails+"|\n191100100010050"+customer+"|\n491100300100065   SPH|\n291100201700355"+machine+"|";
                       var eject = "\nQ0001|\nE|";
                       var next = "\nC0420|";
                       var contentToPrint ;
                       if(numbers == 1)
                       {
                          contentToPrint = start+printcode+eject;
                       }
                       else
                       {
                         var even = numbers % 2 ;
                         var twoPrint = start+printcode+next+printcode+eject;
                         var onePrint = start+printcode+next+eject;
                         console.log(even);
                         if(even == 0)
                         {
                           var numRows = numbers / 2 ;
                           console.log(numRows);
                           var a = 0;
                           for(let i=1 ; i <= numRows; i++)
                           {
                             if(contentToPrint == undefined)
                             {
                               contentToPrint = twoPrint;
                             }
                             else
                             {
                               contentToPrint += "\n"+twoPrint;
                             }
                             
                           }
                         }
                         else
                         {
                           var lasteven = numbers - 1;
                           var numRows = lasteven / 2 ;
                           console.log(numRows);
                           var a = 0;
                           for(let i=1 ; i <= numRows; i++)
                           {
                             if(contentToPrint == undefined)
                             {
                               contentToPrint = twoPrint;
                             }
                             else
                             {
                               contentToPrint += "\n"+twoPrint;
                             }
                           }
                           contentToPrint += "\n"+onePrint;
                         }
                       }
                       //const contentToPrint = '\x02'+'m\n'+'\x02' +"L\nD11\nH18\n191100202000025"+" "+pack_date+" "+manu_batch+" "+mrp+"\n191100101770080"+color_code+"\n191100101550080"+product_name+"\n1e6108100800080#"+barcode_value+"\n291100301500335SPH\n191100300320085 "+sku+" "+batch_serial+"\n191100100110060*"+bill_details+"*\n491100200470055"+item_code+"\n491100200470080"+pack_code+"\nC0420\n191100202000025    "+pack_date+" "+manu_batch+" "+mrp+"\n191100101770080"+color_code+"\n191100101550080"+product_name+"\n1e6108100800080#"+barcode_value+"\n291100301500335SPH\n191100300320085 "+sku+" "+batch_serial+"\n191100100110060*"+bill_details+"*\n491100200470055"+item_code+"\n491100200470080"+pack_code+"\nQ0001\nE";
                       printContent(contentToPrint);
                   }

               })
           });
           function printContent(content) {
               const printWindow = window.open('', '_blank');
               printWindow.document.open();
               /////
               const contentWithLineBreaks = content.replace(/\n/g, '<br>');
               // Write the modified content to the new window
               printWindow.document.write(contentWithLineBreaks);
               //
             //  printWindow.document.write(content);
               printWindow.document.close();
               printWindow.print();
             }