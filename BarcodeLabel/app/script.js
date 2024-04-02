$(document).ready(function () { 
    console.log("ready");
    ZOHO.CREATOR.init()
      .then(function() {
        var search = "";
        var queryParams = ZOHO.CREATOR.UTIL.getQueryParams();
        var rcv;
        search = queryParams.searchInput;
        var dispenseId = queryParams.dispenseId;
        var ponum = queryParams.poNum;
        var customer = queryParams.customer;
        var prepack = queryParams.prepackid;
        var indbatch = queryParams.batch;
        console.log(ponum);
        console.log(search);
        console.log(prepack);
        ///po and rxv number showing on widget load///
        if(search != undefined)
        {
        var h5element = document.getElementById("ponumber");
        var currentText = h5element.textContent;
        var newh5element = currentText+"Purchase Order : " +ponum+" |  Purchase Receives : "+search;
        console.log(h5element);
        console.log(newh5element);
        h5element.textContent = newh5element;
        ///get receives///
        var config = {
            appName: "sph",
            reportName: "All_Batch_Receive_Line_Items",
            criteria : `(Receive_Number == \"${search}\")`
        };
        console.log(config);
        var getRecord = ZOHO.CREATOR.API.getAllRecords(config);
        getRecord.then(function(response){
            console.log("in");
            console.log(response.data);
            console.log(response.data.length);
            var firstdata=response.data[0];
           var receives;
           receives = response.data;
           rcv = receives;
           if(firstdata != undefined)
           {
             var vendor = firstdata.Vendor_Name;
             var billnum = firstdata.Bill_Number;
             var billdate = firstdata.Bill_Date;
             var podate = firstdata.PO_Date;
             var other = document.getElementById("other");
             var otherdetails = "Bill No: "+ billnum+" | Bill Date: "+ billdate+" | PO Date: "+podate;
             other.textContent = otherdetails;
             var vendorname = document.getElementById("vendorname");
             vendorname.textContent = "Vendor: "+vendor;
           }
            ///collecting batch details///
            if(response.data != undefined)
            {
              const newHeader = ["Item Description","Batch Serial Number","Print","Nos","MRP","Pack Date"]
             const head1 = document.getElementById("head1");
             const head2 = document.getElementById("head2");
             const head3 = document.getElementById("head3");
             const head4 = document.getElementById("head4");
             const head5 = document.getElementById("head5");
             const head6 = document.getElementById("head6");
             head1.textContent = newHeader[0];
             head2.textContent = newHeader[1];
             head3.textContent = newHeader[2];
             head4.textContent = newHeader[3];
             head5.textContent = newHeader[4];
             head6.textContent = newHeader[5];

              // Get a reference to the table body
               const tableBody = document.getElementById('table-body');
               receives.forEach(data =>{
                 const row = document.createElement('tr');
                 const batchIdCell = document.createElement('td');
                 const printButtonCell = document.createElement('td');
                 const printButton = document.createElement('button');
                 const totalBarcode = document.createElement('td');
                 const itemDesc = document.createElement('td');
                 const Mrp = document.createElement('td');
                 const packdates = document.createElement('td');
                 // Set the Batch ID cell content
                 batchIdCell.textContent = data.Barcode_Value;
                 totalBarcode.textContent = data.Quantity_to_Receive;
                 itemDesc.textContent = data.Item.display_value + "-"+data.SKU.display_value;
                 Mrp.textContent = data.MRP;
                 packdates.textContent = data.Pack_Date;
                 // Set the text and click event handler for the Print button
                 printButton.textContent = 'Print';
                 printButton.className = "btn btn-primary print-button";
                 printButton.id = "print-button";
                 printButton.type = "button";
                 // Append cells and button to the row
                 printButtonCell.appendChild(printButton);
                 row.appendChild(itemDesc);
                 row.appendChild(batchIdCell);
                 row.appendChild(printButtonCell);
                 row.appendChild(totalBarcode);
                 row.appendChild(Mrp);
                 row.appendChild(packdates);
                 

                 // Append the row to the table body
                 tableBody.appendChild(row);

               })
            }
        })
            // Event delegation for the "Print" buttons
            const contentDiv = document.getElementById('content');
            const printButton = document.getElementById('print-button');
            $('#table-body').on('click', '.print-button', function () {
                // Find the closest <tr> element and then find the <td> with Batch ID
               // const batchSerialNumber = row.querySelector('td:nth-child(2)').textContent;
                const batchId = $(this).closest('tr').find('td:nth-child(2)').text();
                console.log('Batch ID:', batchId);
                console.log(rcv);
                ///collect all batch details///
                rcv.forEach(data =>{
                    var batch_serial = data.Barcode_Value;
                    if(batch_serial == batchId)
                    {
                        var item_name;
                        item_name = data.Item.display_value;
                        console.log(item_name);
                        var barcode_value = data.Barcode_Value;
                        var pack_date = data.Pack_Date;
                        var manu_batch = data.Manufacture_Batch_Code;
                        var mrp = data.MRP;
                        var item_code = data.Item_Code ;
                        var pack_code = data.Pack_Code ;
                        var product_name = data.Product_Code;
                        var bill_details = data.Bill_Code;
                        var color_code = data.Color_Code;
                        var numbers = data.Quantity_to_Receive;
                        var len = numbers.length;
                        var sku = data.SKU.display_value;
                        console.log(barcode_value +","+pack_date+","+manu_batch+","+mrp);
                        var spaces = "   ";
                        ///Print content concatinate in a long string///
                        //var start =  '\x02'+'m\n'+'\x02L\nD11\nH18';
                        var start =  '~m|\n'+'~L|\nD11|\nH18|';
                        var printcode = "\n191100202000025"+spaces+pack_date+" "+manu_batch+" "+mrp+"|\n191100101770080"+color_code+"|\n191100101550080"+product_name+"|\n1e6108100720090"+barcode_value+"|\n291100301500335SPH|\n191100300320085 "+batch_serial+"|\n191100100110060*"+bill_detzeails+"*|\n491100100200050"+item_code+"|\n491100200470080"+pack_code+"|";
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
            }
            else if(dispenseId != undefined){
              console.log(dispenseId);
              ///get dispense details and table details///
              var config = {
                appName: "sph",
                reportName: "All_Dispensing_Batches",
                criteria : `(Dispense_Job == \"${dispenseId}\")`
            };
            console.log(config);
            const newHeader = ["Item Code","Batch Serial Number","Print","Nos","MRP","Color Code-Color Name"]
            const head1 = document.getElementById("head1");
            const head2 = document.getElementById("head2");
            const head3 = document.getElementById("head3");
            const head4 = document.getElementById("head4");
            const head5 = document.getElementById("head5");
            const head6 = document.getElementById("head6");
            head1.textContent = newHeader[0];
            head2.textContent = newHeader[1];
            head3.textContent = newHeader[2];
            head4.textContent = newHeader[3];
            head5.textContent = newHeader[4];
            head6.textContent = newHeader[5];
            var getRecord = ZOHO.CREATOR.API.getAllRecords(config);
            getRecord.then(function(response){
              console.log(response.data);
              var dispData = response.data[0];
              console.log(response.data);
               var productName = dispData.Product_Name.display_value;
             ///get product details///
              Itemconfig = {
                          appName : "sph",
                          reportName : "All_Items",
                          id: `${dispData.SKU.ID}`
                      } 
                      console.log(Itemconfig);
                    var getItem =  ZOHO.CREATOR.API.getRecordById(Itemconfig);
                    getItem.then(function(response){
                        console.log(response.data);
                        var itemData = response.data;
                        var itemcode = itemData.Manufacture_Product_Code+" "+itemData.Pack_Master.display_value+itemData.CDS;
                        var salesorder = dispData.Sales_Order.display_value;
                      

                                                ///salesorderdetails///
                                                soconfig = {
                                                  appName : "sph",
                                                  reportName : "All_Sales_Order",
                                                    id: `${dispData.Sales_Order.ID}`
                                                }
                                    var sorecord = ZOHO.CREATOR.API.getRecordById(soconfig);
                                    sorecord.then(function(response){
                                      var sodata = response.data;
                                      console.log(sodata);
                                      var salesperson = sodata.Sales_Person.display_value;
                        ///get dispense job details///
                        dispconfig = {
                                      appName : "sph",
                                      reportName : "All_Dispensing_Jobs",
                                        id: `${dispData.Job_ID.ID}`
                                    }
                         console.log(dispconfig)
                        var disprecords = ZOHO.CREATOR.API.getRecordById(dispconfig);
                        disprecords.then(function(response){
                              console.log(response.data);
                              var dispsku = response.data;
                              var colorcode = dispsku.Color_Code.display_value;
                              let parts = colorcode.split('-');
                              var colrcode= parts[0]+" "+itemData.Pack_Master.display_value+itemData.CDS;
                              console.log("code"+colrcode);
                              var codeonly = parts[1];
                              var orderquantity = dispsku.Quantity;
                              var dispMRP = itemData.MRP; 
                              console.log(dispMRP);
                              ///load initial job details///
                              var h5element = document.getElementById("ponumber");
                              var currentText = h5element.textContent;
                              var newh5element = currentText+"Sales Order : " +salesorder+" |  Dispensing Job : "+dispenseId;
                              var machine = dispData.Machine_ID.display_value;
                              var staff = dispData.Tint_Staff_ID.display_value;
                              console.log(machine + staff);
                              var Vh5element = document.getElementById("vendorname");
                              var currentText = Vh5element.textContent;
                              var vnewh5element = "Customer Name: "+currentText+customer;
                              Vh5element.textContent = vnewh5element;
                              var sh5element = document.getElementById("other");
                              var currentText = sh5element.textContent;
                              var snewh5element = "Tint Staff ID: "+currentText+staff+" | Machine ID: "+machine;
                              sh5element.textContent = snewh5element;
                              console.log(h5element);
                              console.log(newh5element);
                              h5element.textContent = newh5element;
                              sodetails = queryParams.sodetails;
                              var base = queryParams.base;
                              ///get dispense batches///
                        var batchconfig = {
                          appName: "sph",
                          reportName: "All_Dispensing_Batch_Line_Items",
                          criteria: `(Dispense_Job == ${dispData.Job_ID.ID})`
                      };
                      
                      console.log(batchconfig);
                      
                      var getallbatch = ZOHO.CREATOR.API.getAllRecords(batchconfig);
                      getallbatch.then(function(response){
                          console.log(response);
                          var dispbatch = response.data;
                          dispbatch.forEach(data =>{
                              // Adding values in the table//
                              const tableBody = document.getElementById('table-body');
                              const row = document.createElement('tr');
                              const batchIdCell = document.createElement('td');
                              const printButtonCell = document.createElement('td');
                              const printButton = document.createElement('button');
                              const totalBarcode = document.createElement('td');
                              const itemDesc = document.createElement('td');
                              const Mrp = document.createElement('td');
                              const packdates = document.createElement('td');
                              // Set the Batch ID cell content
                              batchIdCell.textContent = data.Batch_Serial_Number.display_value;
                              totalBarcode.textContent = data.Quantity;
                              itemDesc.textContent = itemcode;
                              Mrp.textContent = dispMRP;
                              packdates.textContent = colorcode;
                              // Set the text and click event handler for the Print button
                              printButton.textContent = 'Print';
                              printButton.className = "btn btn-primary print-button";
                              printButton.id = "print-button";
                              printButton.type = "button";
                              // Append cells and button to the row
                              printButtonCell.appendChild(printButton);
                              row.appendChild(itemDesc);
                              row.appendChild(batchIdCell);
                              row.appendChild(printButtonCell);
                              row.appendChild(totalBarcode);
                              row.appendChild(Mrp);
                              row.appendChild(packdates);
                              
                              // Append the row to the table body
                              tableBody.appendChild(row);
                          })
           // Event delegation for the "Print" buttons
           const contentDiv = document.getElementById('content');
           const printButton = document.getElementById('print-button');
           $('#table-body').on('click', '.print-button', function () {
               // Find the closest <tr> element and then find the <td> with Batch ID
              // const batchSerialNumber = row.querySelector('td:nth-child(2)').textContent;
               const batchId = $(this).closest('tr').find('td:nth-child(2)').text();
               console.log('Batch ID:', batchId);
               dispbatch.forEach(data =>{
                var dbatch_serial = data.Batch_Serial_Number.display_value;
                if(dbatch_serial == batchId)
                {
                    var sspace = "    ";
                    var dsku = data.SKU.display_value;
                    var newb = dsku+sspace+batchId;
                    var numbers = data.Quantity;
                    
                    ///Print content concatinate in a long string///
                    //var start =  '\x02'+'m\n'+'\x02L\nD11\nH18';
                    const originalString = "491100300100075";
                    const numberOfSpaces = 6; // Adjust the number of spaces as needed
                    const spaces = " ".repeat(numberOfSpaces);

                    const finalString = originalString + spaces + spaces + spaces + "SPH";
                    console.log(finalString);
                    var start =  '~m|\n'+'~L|\nD11|\nH15|';
                    var printcode = "\n191100201900060"+base+"|\n191100201600060"+colrcode+"|\n191100201300060"+codeonly+"|\n191100300900060"+newb+"|\n191100200600070 SA-"+salesperson+" TB-"+staff+"|\n191100200300040 SO "+sodetails+"|\n191100100010070"+customer+"|\n"+finalString+"|\n291100201700355"+machine+"|";
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
           })
           function printContent(content) {
            const printWindow = window.open('', '_blank');
            printWindow.document.open();

            /////
            uconfig = {

              reportName : "All_Customers",
              id: "181172000001170055",
              data : {"Customer_Name": "Gowryyy" }
            }
            console.log(uconfig);
            //update record API
           ZOHO.CREATOR.API.updateRecord(uconfig).then(function(response){
             console.log(response)
            });
            const contentWithLineBreaks = content.replace(/\n/g, '<br>');
            // Write the modified content to the new window
            printWindow.document.write(contentWithLineBreaks);
            //
          //  printWindow.document.write(content);
            printWindow.document.close();
            printWindow.print();
          }
  
              });

                      });


                        });
                      });
              
                    }); 
            }
            // prepack barcode
            else if(prepack != undefined)
            {
              console.log(prepack);
          ///get prepack details///
              var config = {
              appName: "sph",
              reportName: "All_Pre_Packings_Widget",
              criteria : `(Pre_Packing_Number == \"${prepack}\")`
              };
              console.log(config);
              var getRecord = ZOHO.CREATOR.API.getAllRecords(config);
              getRecord.then(function(response){
                console.log(response.data);
                var ppackID = response.data[0].ID;
                console.log(response.data[0].ID);
                var mainitem = response.data[0].Pre_Packing_Item.ID;
                var predate = response.data[0].Date_field;
                var premain = response.data[0].Pre_Packing_Item.display_value;
                var responseString = response.data[0].Response;
                  console.log(responseString);
                    //\\\\\prepack contents///\\\\\\\
                    var h5element = document.getElementById("ponumber");
                    var currentText = h5element.textContent;
                    var newh5element = currentText+"Pre-Pack: " +prepack+" |  Pre-Pack Date : "+predate;
                    var Vh5element = document.getElementById("vendorname");
                    var currentText = Vh5element.textContent;
                    var vnewh5element = "Pre-Pack Item: "+premain;
                    Vh5element.textContent = vnewh5element;
                    console.log(newh5element);
                    h5element.textContent = newh5element;
                    ///map loop///
                    // Parse the JSON string into a JavaScript object
var responseObject = JSON.parse(responseString);

// Access data from the JavaScript object
var packnumber= responseObject.PrePack_Number;
var packdate= responseObject.PrePack_Date;

// Check if 'Products' array exists before trying to iterate over it
if (responseObject.Products && Array.isArray(responseObject.Products)) {
    // Iterate over the 'Products' array
    responseObject.Products.forEach(function(product) {
        console.log("Product Name:", product.Product_Name);
        console.log("SKU:", product.SKU);
        console.log("Net Weight:", product.Net_Weight);
        console.log("Batch:", product.Batch);
        console.log("MRP:", product.MRP);
                    const newHeader = ["Item Description","Batch Serial Number","Print","Nos","Barcode","Pack Date"]
                    const head1 = document.getElementById("head1");
                    const head2 = document.getElementById("head2");
                    const head3 = document.getElementById("head3");
                    const head4 = document.getElementById("head4");
                    const head5 = document.getElementById("head5");
                    const head6 = document.getElementById("head6");
                    head1.textContent = newHeader[0];
                    head2.textContent = newHeader[1];
                    head3.textContent = newHeader[2];
                    head4.textContent = newHeader[3];
                    head5.textContent = newHeader[4];
                    head6.textContent = newHeader[5];
             /*\\\\\\\\\\\\\\creating table data\\\\\\\\\\\\\*/
             const tableBody = document.getElementById('table-body');
                              const row = document.createElement('tr');
                              const batchIdCell = document.createElement('td');
                              const printButtonCell = document.createElement('td');
                              const printButton = document.createElement('button');
                              const totalBarcode = document.createElement('td');
                              const itemDesc = document.createElement('td');
                              const Mrp = document.createElement('td');
                              const packdates = document.createElement('td');
                              // Set the Batch ID cell content
                              batchIdCell.textContent = product.Batch;
                              totalBarcode.textContent = product.Quantity;
                              itemDesc.textContent = product.Product_Name;
                              Mrp.textContent = product.MRP;
                              packdates.textContent = packdate;
                              // Set the text and click event handler for the Print button
                              printButton.textContent = 'Print';
                              printButton.className = "btn btn-primary print-button";
                              printButton.id = "print-button";
                              printButton.type = "button";
                              // Append cells and button to the row
                              printButtonCell.appendChild(printButton);
                              row.appendChild(itemDesc);
                              row.appendChild(batchIdCell);
                              row.appendChild(printButtonCell);
                              row.appendChild(totalBarcode);
                              row.appendChild(Mrp);
                              row.appendChild(packdates);
                              
                              // Append the row to the table body
                              tableBody.appendChild(row);
                            });
                           
} else {
  console.log("Products array is either missing or not an array.");
}
                      // Event delegation for the "Print" buttons
            const contentDiv = document.getElementById('content');
            const printButton = document.getElementById('print-button');
            $('#table-body').on('click', '.print-button', function () {
                // Find the closest <tr> element and then find the <td> with Batch ID
               // const batchSerialNumber = row.querySelector('td:nth-child(2)').textContent;
                const batchId = $(this).closest('tr').find('td:nth-child(2)').text();
                console.log('Batch ID:', batchId);
                ///collect all batch details///
                responseObject.Products.forEach(data =>{
                    var batch_serial = data.Batch;
                    console.log( data.Batch);
                    if(batch_serial == batchId)
                    {
                     
                        var itemcode =data.Product_Code;
                        var productionOrder = packnumber;
                        var batchnumber = batchId;
                        var itemName = data.Product_Name;
                        var batchDate = "";
                        var barcodeValue = data.SKU+data.Batch;
                        var MRp = data.MRP;
                        var netWeight = data.Net_Weight;
                        var packDate = packdate;
                        var sku_batch = data.SKU;
                        var numbers = data.Quantity;
                        ///Print content concatinate in a long string///
                        //var start =  '\x02'+'m\n'+'\x02L\nD11\nH18';
                        var start =  '~m|\n'+'~L|\nD11|\nH18|';
                        var printcode = "\n191100202850045"+itemcode+"|\n191100202850400"+productionOrder+"|\n1e2108102100050#"+barcodeValue+"|\n191100202400300"+sku_batch+"|\n191100202100310NODT"+batchId+"|\n191100201750050"+itemName+"|\n191100201450050Item remains|\n191100201150050M.R.P."+MRp+"|\n191100101250280(Inclusive of all taxes)|"+"\n191100100950050"+netWeight+"      Pkd on."+packDate+"|\n191100100700050For Feedback/Complaints  2331257, 2330552|\n191100200400110SANTHA PAINT HOUSE|\n191100100200110G.P.O. JUNCTION, TRIVANDRUM|\n491100100150040Buyers use only, Not for resale|\n291100103100532Buyers use only, Not for resale|";
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
                 
              });
            }
            // individual barcode
            else if(indbatch != undefined)
            {
              batchconfig = {
                              appName : "sph",
                              reportName : "All_Batches_Widget",
                              id: `${indbatch}`
                            } 
            console.log(batchconfig);
           var getBatch =  ZOHO.CREATOR.API.getRecordById(batchconfig);
               getBatch.then(function(response){
              console.log(response.data);
              var itemid = response.data.Item.ID;
             var itemconfig = {
                appName : "sph",
                reportName : "All_Items",
                id: `${itemid}`
              } 
              var itemBatch =  ZOHO.CREATOR.API.getRecordById(itemconfig);
              itemBatch.then(function(itemresp){
                console.log(itemresp);
                var itemtype = itemresp.Product_Type;
  
              var resp = response.data.Response_Json;
              var responseObject = JSON.parse(resp);
              // Access data from the JavaScript object
              if(itemtype != "Prepack")
              {  
              var billdate= responseObject.bill_date;
              console.log(billdate);
              var recvdate = responseObject.receive_date;
              // Parse the bill date string into a Date object
              var dateObj = new Date(billdate);

              // Get the day, month, and year components
              var day = dateObj.getDate().toString().padStart(2, '0'); // padStart ensures 2 digits
              var month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
              var year = dateObj.getFullYear().toString().slice(2); // Get last two digits of the year

              // Combine day, month, and year components
              var formattedbDate = day + month + year;

              console.log("Formatted Date:", formattedbDate);
              
               // Parse the receive date string into a Date object
               var dateObj = new Date(recvdate);

               // Get the day, month, and year components
               var day = dateObj.getDate().toString().padStart(2, '0'); // padStart ensures 2 digits
               var month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
               var year = dateObj.getFullYear().toString().slice(2); // Get last two digits of the year
 
               // Combine day, month, and year components
               var formattedrcvDate = day + month + year;
 
               console.log("Formatted Date:", formattedrcvDate);
                   // Adding values in the table//
                   const newHeader = ["Item Description","Batch Serial Number","Print","Nos","MRP","Pack Date"]
                   const head1 = document.getElementById("head1");
                   const head2 = document.getElementById("head2");
                   const head3 = document.getElementById("head3");
                   const head4 = document.getElementById("head4");
                   const head5 = document.getElementById("head5");
                   const head6 = document.getElementById("head6");
                   head1.textContent = newHeader[0];
                   head2.textContent = newHeader[1];
                   head3.textContent = newHeader[2];
                   head4.textContent = newHeader[3];
                   head5.textContent = newHeader[4];
                   head6.textContent = newHeader[5];
                   const tableBody = document.getElementById('table-body');
                   const row = document.createElement('tr');
                   const batchIdCell = document.createElement('td');
                   const printButtonCell = document.createElement('td');
                   const printButton = document.createElement('button');
                   const totalBarcode = document.createElement('td');
                   const itemDesc = document.createElement('td');
                   const Mrp = document.createElement('td');
                   const packdates = document.createElement('td');
                   // Set the Batch ID cell content
                   batchIdCell.textContent = response.data.Batch_Number;
                   totalBarcode.textContent = 1;
                   itemDesc.textContent = response.data.Item.display_value;
                   Mrp.textContent = responseObject.mrp;
                   packdates.textContent = responseObject.pack_date;
                   // Set the text and click event handler for the Print button
                   printButton.textContent = 'Print';
                   printButton.className = "btn btn-primary print-button";
                   printButton.id = "print-button";
                   printButton.type = "button";
                   // Append cells and button to the row
                   printButtonCell.appendChild(printButton);
                   row.appendChild(itemDesc);
                   row.appendChild(batchIdCell);
                   row.appendChild(printButtonCell);
                   row.appendChild(totalBarcode);
                   row.appendChild(Mrp);
                   row.appendChild(packdates);
                   // Append the row to the table body
                   tableBody.appendChild(row);
                   

                     // Event delegation for the "Print" buttons
                     const contentDiv = document.getElementById('content');
                     $('#table-body').on('click', '.print-button', function () {
                         // Find the closest <tr> element and then find the <td> with Batch ID
                        // const batchSerialNumber = row.querySelector('td:nth-child(2)').textContent;
                         const batchId = $(this).closest('tr').find('td:nth-child(2)').text();
                         console.log('Batch ID:', batchId);
                         var item_name;
                         item_name = response.data.Item.display_value;
                         console.log(item_name);
                         var barcode_value = response.data.Barcode_Value;
                         var pack_date = response.data.Pack_Date;
                         var manu_batch = response.data.Manufacture_Batch_Code;
                         var mrp = response.data.MRP;
                         var item_code = responseObject.manu_product_code ;
                         var pack_code = itemresp.data.Pack_Master.display_value+" "+itemresp.data.CDS;
                         var product_name = itemresp.data.Product_Name.display_value;
                         var bill_details = responseObject.bill_no+formattedbDate+formattedrcvDate;
                         var color_code = itemresp.data.Brand.display_value+" "+itemresp.data.RM_Code+" "+itemresp.data.RM_Color;
                         var numbers = 1;
                         var len = numbers.length;
                         var sku = response.data.SKU.display_value;
                         console.log(barcode_value +","+pack_date+","+manu_batch+","+mrp);
                         var spaces = "   ";
                         ///Print content concatinate in a long string///
                         //var start =  '\x02'+'m\n'+'\x02L\nD11\nH18';
                         var start =  '~m|\n'+'~L|\nD11|\nH18|';
                         var printcode = "\n191100202000025"+spaces+pack_date+" "+manu_batch+" "+mrp+"|\n191100101770080"+color_code+"|\n191100101550080"+product_name+"|\n1e6108100720090"+barcode_value+"|\n291100301500335SPH|\n191100300320085 "+batchId+"|\n191100100110060*"+bill_details+"*|\n491100100200050"+item_code+"|\n491100200470080"+pack_code+"|";
                         var eject = "\nQ0001|\nE|";
                         var next = "\nC0420|";
                         var contentToPrint ;
                         if(numbers == 1)
                         {
                            contentToPrint = start+printcode+eject;
                         }
                         printContent(contentToPrint);
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
                 }  }) ;
                }); }
           });    
      
        
          
		
    });
