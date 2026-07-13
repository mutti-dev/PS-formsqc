value = 0

['EarnedAmount', 'UnemploymentAmount', 'SSIAmount', 'SSDIAmount', 'VADisabilityServiceAmount', 'VADisabilityNonServiceAmount', 'PrivateDisabilityAmount', 'WorkersCompAmount', 'TANFAmount', 'GAAmount', 'SocSecRetirementAmount', 'PensionAmount', 'ChildSupportAmount', 'AlimonyAmount', 'OtherIncomeAmount', ]


if((data.Container.EarnedAmount * 1) > 0){
  value += (data.Container.EarnedAmount * 1);
}

if((data.Container.UnemploymentAmount * 1) > 0){
  value += (data.Container.UnemploymentAmount * 1);
}
