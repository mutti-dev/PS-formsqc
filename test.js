value = 0;

if (data.Container.Feeling_nervous_anxious_or_on_edge === "Several_days") {
  value += 1;
}
if (data.Container.Feeling_nervous_anxious_or_on_edge === "More_than_half_the_days") {
  value += 2;
}
if (data.Container.Feeling_nervous_anxious_or_on_edge === "Nearly_every_day") {
  value += 3;
}

if (data.Container.Not_being_able_to_stop_or_control_worrying === "Several_days") {
  value += 1;
}
if (data.Container.Not_being_able_to_stop_or_control_worrying === "More_than_half_the_days") {
  value += 2;
}
if (data.Container.Not_being_able_to_stop_or_control_worrying === "Nearly_every_day") {
  value += 3;
}

if (data.Container.Worrying_too_much_about_different_things === "Several_days") {
  value += 1;
}
if (data.Container.Worrying_too_much_about_different_things === "More_than_half_the_days") {
  value += 2;
}
if (data.Container.Worrying_too_much_about_different_things === "Nearly_every_day") {
  value += 3;
}

if (data.Container.Trouble_relaxing === "Several_days") {
  value += 1;
}
if (data.Container.Trouble_relaxing === "More_than_half_the_days") {
  value += 2;
}
if (data.Container.Trouble_relaxing === "Nearly_every_day") {
  value += 3;
}

if (data.Container.Being_so_restless_that_it_is_hard_to_sit_still === "Several_days") {
  value += 1;
}
if (data.Container.Being_so_restless_that_it_is_hard_to_sit_still === "More_than_half_the_days") {
  value += 2;
}
if (data.Container.Being_so_restless_that_it_is_hard_to_sit_still === "Nearly_every_day") {
  value += 3;
}

if (data.Container.Becoming_easily_annoyed_or_irritated === "Several_days") {
  value += 1;
}
if (data.Container.Becoming_easily_annoyed_or_irritated === "More_than_half_the_days") {
  value += 2;
}
if (data.Container.Becoming_easily_annoyed_or_irritated === "Nearly_every_day") {
  value += 3;
}

if (data.Container.Feeling_afraid_as_if_something_awful_might_happen === "Several_days") {
  value += 1;
}
if (data.Container.Feeling_afraid_as_if_something_awful_might_happen === "More_than_half_the_days") {
  value += 2;
}
if (data.Container.Feeling_afraid_as_if_something_awful_might_happen === "Nearly_every_day") {
  value += 3;
}