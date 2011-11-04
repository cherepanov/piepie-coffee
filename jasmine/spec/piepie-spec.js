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

  describe('check data', function() {
	  it("data must be loaded correctly", function() {
		  expect(piepie.getLabelText()).toEqual(testData.label);
	  });
  });

  describe('check visual', function() {
	  it("legend must not cross chart boundary", function() {
		  expect(
				  piepie.getPrivateProperty("legendPosX") + piepie.getPrivateProperty("legendWidth")
		  ).toBeLessThan(piepie.getPrivateProperty("chartWidth"));
	  });
	  
	  it("legend must not cross chart boundary", function() {
		  console.log(piepie.getPrivateProperty("legendHeight"));
		  console.log(piepie.getPrivateProperty("legendPosY"));
		  expect(
				  piepie.getPrivateProperty("legendPosY") + piepie.getPrivateProperty("legendHeight") - 1
		  ).toBeLessThan(piepie.getPrivateProperty("chartHeight"));
	  });
  });
  
});