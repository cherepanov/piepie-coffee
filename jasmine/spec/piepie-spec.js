describe("PiePie", function() {
  var piepie, testData;

  beforeEach(function() {
    piepie = new PiePie({
				x: 600,
				y: 100,
				width: 350,
				height: 300,
				background: {fill: "#eee", stroke: "none"},
				colors: ["#265434", "#3F99D2", "#ED23CD", "#B6EBD9", "#68AB79"],
				dataURL: "http://localhost/testdata/piepie.json",
				onDrawFinish: function() {/*piepie.getLabelText()*/;}
			});
    $.ajax("http://localhost/testdata/piepie.json", {async: false}).done(function(res){ testData = res;});
    waits(5000);
  });

  it("should be able create instance", function() {
    expect(piepie).toBeDefined();
  });

  it("label must equal", function() {
	  console.log(piepie.getLabelText());
	  console.log(piepie.getPrivateProperty("legendWidth"));
	  console.log(piepie.getPrivateProperty("legendHeight"));
	  expect(piepie.getLabelText()).toEqual(testData.label);
  });

});