const codeContentData = [
  { 
    heading: "Calculate Age if both Age and DOB is from simple form", 
    content: `if(typeof row.dob != "undefined" ){
  let DOB = row.dob;

  if (DOB !== "") {
	var selectedYear = new Date(DOB);
	var ageDifMs = Date.now() - selectedYear.getTime();
	var ageDate = new Date(ageDifMs);
	value = Math.abs(ageDate.getUTCFullYear() - 1970);
  }
  else {
	value = 0;
  }
}
`
  },
  { 
    heading: "Calculate Sum Of Field Without Array", 
    content: `value = 0;
if((data.Container.Select_1 * 1) > 0){
  value += (data.Container.Select_1 * 1);
}

if((data.Container.Select_2 * 1) > 0){
  value += (data.Container.Select_2 * 1);}
`
  },

//   ========================
  { 
    heading: "Currency Addition", 
    content: `value = 0;
if((data.Container.Brief_Resilience_Scale_BRS.I_tend_to_bounce_back_quickly_after_hard_time_ * 1) > 0){
  value += (data.Container.Brief_Resilience_Scale_BRS.I_tend_to_bounce_back_quickly_after_hard_time_ * 1);
}
if((data.Container.Brief_Resilience_Scale_BRS.I_have_a_hard_time_making_it_through__tre__ful_event_ * 1) > 0){
  value += (data.Container.Brief_Resilience_Scale_BRS.I_have_a_hard_time_making_it_through__tre__ful_event_ * 1);
}
`
  },
//   ========================
  { 
    heading: "Sum of fields in survey", 
    content: `value = 0;
if((data.Container.Brief_Resilience_Scale_BRS.I_tend_to_bounce_back_quickly_after_hard_time_ * 1) > 0){
  value += (data.Container.Brief_Resilience_Scale_BRS.I_tend_to_bounce_back_quickly_after_hard_time_ * 1);
}
if((data.Container.Brief_Resilience_Scale_BRS.I_have_a_hard_time_making_it_through__tre__ful_event_ * 1) > 0){
  value += (data.Container.Brief_Resilience_Scale_BRS.I_have_a_hard_time_making_it_through__tre__ful_event_ * 1);
}

`
  },
//   ========================
  { 
    heading: "Average of amount", 
    content: `value= 0;
let num1 = data.container.budget18;
let num2 = data.container.budget20;
let num3 = data.container.budget69;
let avg = (num1 + num2 + num3) / 3
value = avg;

`
  },
//   ========================
  { 
    heading: "Calculate amount from data grid", 
    content: `let sum = 0;
let a = data.Container.Data_Grid1.length;
for (let i = 0; i < a; i++)
{
  if((data.Container.Data_Grid1[i].Amount * 1) > 0){
   sum += data.Container.Data_Grid1[i].Amount;
}
 
}
value = sum;


`
  },
//   ========================
  { 
    heading: "Length For Data grid", 
    content: `value = 0;
let a = data.Container.Data_Grid.length;


for (let i = 0; i < a; i++) {
  if ((data.Container.Data_Grid[i].Household_Member_Names) && data.Container.Data_Grid[i].Relationship_to_HOH) {
    value += 1;}
}


`
  },
//   ========================
  { 
    heading: "Additions of the fields inside grid in each row", 
    content: `value = 0;
let sum = 0;
let num1 = row.A_Employment_or_Wages;
let num2= row.B_Soc_Security_Pensions;
let num3 = row.C_Annual_amount_of_income_received_;
let num4 = row.D_Total_Income_from_Assets;
let num5 = row.E_Other_Income;

if ((num1 *1) > 0){
  sum = sum + num1;
}
if ((num2 *1) > 0){
  sum = sum + num2;
}
if ((num3 *1) > 0){
  sum = sum + num3;
}
if ((num4 *1) > 0){
  sum = sum + num4;
}
if ((num5 *1) > 0){
  sum = sum + num5;
}
value = sum;


`
  },
//   ========================
  { 
    heading: "Calculated total days between 2 dates", 
    content: `let days = 0;
var admissionDate = "";
var dischargeDate = "";
if (!!row.checkIn){
  admissionDate = new Date(row.checkIn);
  admissionDate = admissionDate.getTime();
 
}
else{
  value = 0;
  return value;
}
if (!!row.checkOut){
  dischargeDate = new Date(row.checkOut);
  dischargeDate = dischargeDate.getTime();
}
else {
  dischargeDate = Date.now();
}
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round(Math.abs((dischargeDate - admissionDate) / oneDay));
  value = diffDays;


`
  },
//   ========================
  { 
    heading: "Calculate days from current date", 
    content: `if (typeof row.TransDate !== "undefined") {
  let DOB = row.TransDate;

  if (DOB !== "") {
    var selectedDate = new Date(DOB);
    var currentDate = new Date();
    var oneDay = 24 * 60 * 60 * 1000;
    var diffDays = Math.round(Math.abs((currentDate - selectedDate) / oneDay));
    value = diffDays;
  } else {
    value = 0;
  }}


`
  },
//   ========================
  { 
    heading: "More than 1 condition in a field", 
    content: `show = false;
var dependsOnValue1 = "Own_apartmenthousetrailer";
var dependsOnValue2 = "With_a_family_member_or_friend";
if(data.Container.Container1.Where_did_you_stay_last_night == dependsOnValue1){

    show = isHidden;

}

if(data.Container.Container1.Where_did_you_stay_last_night == dependsOnValue2){

    show = isHidden;

}



`
  },
//   ========================
  { 
    heading: "Hide Panel From Public Form", 
    content: `show = false;
if (typeof window.token != "undefined" && window.token !== "" && !/publicform/i.test(window.location.href)) {
  show = true;
}
if (window.location.href.indexOf("MobileCaseDetails") > -1) {
  show = true;
}



`
  },
//   ========================
  { 
    heading: "Content conditional code", 
    content: `show = false;
 if(data.Container.Total_Scoring === 0){
    show = true;
}



`
  },
//   ========================
  { 
    heading: "Edit Grid - When You want to show all Fields in edit grid or show fields in more than one line ", 
    content: `
    
    --------------HEADER--------------

    <div class="row">

    <div class="col-md-4"> <b>Task/Support Grid 1</b> </div>
    
    <div class="col-md-4"> <b></b></div>
    
    <div class="col-md-2"> <b></b> </div>
    
    </div>
    
 --------------ROW--------------

<div class="container">
  <div class="row">
    <div class="col-sm-4">
        <b>Service Type:</b>{{ row.ServiceType }}</b>
    </div>
    <div class="col-sm-4">
      <b>Start Date:</b>{{moment(row.StartDate).format("MM-DD-YYYY") }}
    </div>
    <div class="col-sm-4">
        <b>End Date: </b>{{  moment(row.EndDate).format("MM-DD-YYYY") }}
    </div>
  </div>

  <br />
  <br />

  <div class="row">
    <div class="col-sm-4">
      <b>Number Units:</b>{{ row.NumberUnits2 }}
    </div>
    <div class="col-sm-4">
      <b>Hours Per Week: </b>{{ row.HoursPerWeek2 }}
    </div>
    <div class="col-sm-4">
        <b>Cost Per Unit: </b>{{ row.CostPerUnit2 }}
      </div>
  </div>

  <br />
  <br />

  <div class="row">
    <div class="col-sm-4">
        <b>Number Previous Auths:</b>{{row.NumberPreviousAuths1 }}
      </div>
      <div class="col-sm-4">
        <b>Last Authorization?:</b> {{ row.LastAuth1 }}
    </div>
    
      <div class="col-sm-4">
          <b>EstimatedTotalCost:</b>{{ row.EstimatedTotalCost }}
        </div>
    {% if (!instance.options.readOnly && !instance.originalComponent.disabled) {
    %}
    <div class="col-sm-4">
      <div class="btn-group pull-right">
        <button class="btn btn-default btn-light btn-sm editRow">
          <i class="{{ iconClass('edit') }}"></i>
        </button>
        {% if (!instance.hasRemoveButtons || instance.hasRemoveButtons()) { %}
        <button class="btn btn-danger btn-sm removeRow">
          <i class="{{ iconClass('trash') }}"></i>
        </button>
        {% } %}
      </div>
    </div>
    {% } %}
  </div>
</div>


`
  },
//   ========================
  { 
    heading: "EditGrid - When you want to show fields in one row", 
    content: `
    
     --------------HEADER--------------
    
    
    <div class="row">

<div class="col-md-4"> <b>Household Member Name</b> </div>

<div class="col-md-4"> <b>Relationship</b> </div>

<div class="col-md-2"> <b>DOB</b> </div>

</div>



 --------------ROW--------------


 <div class="row">
<div class="col-md-4">{{ row.name }}</div>

<div class="col-md-4">{{ row.relationshipToTheVictim }}</div>

<div class="col-md-2">{{ row.dob }}</div>

{% if (!instance.options.readOnly && !instance.originalComponent.disabled) { %}
	<div class="col-sm-12">
  	<div class="btn-group pull-right">
    	<button class="btn btn-default btn-light btn-sm editRow"><i class="{{ iconClass('edit') }}"></i></button>
    	{% if (!instance.hasRemoveButtons || instance.hasRemoveButtons()) { %}
      	<button class="btn btn-danger btn-sm removeRow"><i class="{{ iconClass('trash') }}"></i></button>
    	{% } %}
  	</div>
	</div>
  {% } %}
</div>



`
  },
//   ========================
  { 
    heading: "CSS CODES - Adding Border", 
    content: `
    
    Follow these steps
●	Add html component 
●	Inside display tab in html tag field write style
●	In Content Add code
	.lineLayout {
border: 1px solid black;
}

●	Add Another Html component
●	Inside display tab in html tag field write hr
●	Inside display tab in CSS Class field write class name (lineLayout)

Code Changing Font-family in entire form

1.	Drag and drop HTML Element Component from Layout at the top of you form inside Container.
2.	In Display tab write “style” in HTML Tag field.
3.	Paste the following code inside the Content area of HTML Element Component and save it.


.fontChange  .col-form-label {
 		 font-family: Raleway;
}


4.	Edit your Form Container component.
5.	In Display tab write “fontChange” in Custom CSS Class field and save it.
6.	Save the form you will see that the font-family of all labels inside that form has changed.

`
  },
//   ========================
  { 
    heading: "Role Based Section show/hide", 
    content: `
    
  ---  We need to turn on the below system from system settings. It is by default NO. To render the role base condition code, we first need to tern ''Show role based dynamic form (37)'' to "Yes".



    --this code will work on Add Case and Case Detail



-For Single Role

if($("#currentUserRolesForForm").val() == "ROLENAMEHERE") {
    show = true;
} else {
  show = false;
}

-For multiple Roles

if($("#currentUserRolesForForm").val() && ($("#currentUserRolesForForm").val().split(",").includes(ROLENAME1) || $("#currentUserRolesForForm").val().split(",").includes(ROLENAME2))) {
    show = true;
} else {
  show = false;
}


`
  },
//   ========================
  { 
    heading: "EditGrid - When you want to show fields in one row", 
    content: `
    
     --------------HEADER--------------
    
    
    <div class="row">

<div class="col-md-4"> <b>Household Member Name</b> </div>

<div class="col-md-4"> <b>Relationship</b> </div>

<div class="col-md-2"> <b>DOB</b> </div>

</div>



 --------------ROW--------------


 <div class="row">
<div class="col-md-4">{{ row.name }}</div>

<div class="col-md-4">{{ row.relationshipToTheVictim }}</div>

<div class="col-md-2">{{ row.dob }}</div>

{% if (!instance.options.readOnly && !instance.originalComponent.disabled) { %}
	<div class="col-sm-12">
  	<div class="btn-group pull-right">
    	<button class="btn btn-default btn-light btn-sm editRow"><i class="{{ iconClass('edit') }}"></i></button>
    	{% if (!instance.hasRemoveButtons || instance.hasRemoveButtons()) { %}
      	<button class="btn btn-danger btn-sm removeRow"><i class="{{ iconClass('trash') }}"></i></button>
    	{% } %}
  	</div>
	</div>
  {% } %}
</div>



`
  },
//   ========================
  { 
    heading: "EditGrid - When you want to show fields in one row", 
    content: `
    
     --------------HEADER--------------
    
    
    <div class="row">

<div class="col-md-4"> <b>Household Member Name</b> </div>

<div class="col-md-4"> <b>Relationship</b> </div>

<div class="col-md-2"> <b>DOB</b> </div>

</div>



 --------------ROW--------------


 <div class="row">
<div class="col-md-4">{{ row.name }}</div>

<div class="col-md-4">{{ row.relationshipToTheVictim }}</div>

<div class="col-md-2">{{ row.dob }}</div>

{% if (!instance.options.readOnly && !instance.originalComponent.disabled) { %}
	<div class="col-sm-12">
  	<div class="btn-group pull-right">
    	<button class="btn btn-default btn-light btn-sm editRow"><i class="{{ iconClass('edit') }}"></i></button>
    	{% if (!instance.hasRemoveButtons || instance.hasRemoveButtons()) { %}
      	<button class="btn btn-danger btn-sm removeRow"><i class="{{ iconClass('trash') }}"></i></button>
    	{% } %}
  	</div>
	</div>
  {% } %}
</div>



`
  },
];

export default codeContentData;
